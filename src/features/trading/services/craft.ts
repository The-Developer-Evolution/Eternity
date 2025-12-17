'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getRunningTradingPeriod } from "../action";

export type CraftRecipeDetail = {
  id: string; // CraftItem ID
  name: string;
  recipes: {
    rawItemName: string;
    amount: number;
  }[];
};

export async function getAllCraftRecipes(): Promise<CraftRecipeDetail[]> {
  const craftItems = await prisma.craftItem.findMany({
    include: {
      craftRecipes: {
        include: {
          rawItem: true,
        },
      },
    },
  });

  return craftItems.map((item) => ({
    id: item.id,
    name: item.name,
    recipes: item.craftRecipes.map((r) => ({
      rawItemName: r.rawItem.name,
      amount: r.amount,
    })),
  }));
}

export async function itemToCraft(
  userId: string,
  craftItemId: string
): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

  // 1. Get user trading data including inventory
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found" };
  }
  const tradingData = userResult.data.tradingData;

  // 2. Get Recipe from DB
  const craftItem = await prisma.craftItem.findUnique({
    where: { id: craftItemId },
    include: {
        craftRecipes: {
            include: { rawItem: true }
        }
    }
  });

  if (!craftItem) {
      return { success: false, error: "Craft item not found" };
  }
  
  if (craftItem.craftRecipes.length === 0) {
      return { success: false, error: "No recipe defined for this item" };
  }

  // 3. Validation: Check inventory
  const transactionOps: any[] = [];
  let totalRawConsumed = 0;

  for (const recipe of craftItem.craftRecipes) {
      const userRawAmount = tradingData.rawUserAmounts.find(
          (ura) => ura.rawItemId === recipe.rawItemId
      );

      if (!userRawAmount || userRawAmount.amount < recipe.amount) {
          return { 
              success: false, 
              error: `Insufficient ${recipe.rawItem.name}. Required: ${recipe.amount}, Available: ${userRawAmount?.amount || 0}` 
          };
      }

      // Add to transaction ops: Decrement RawUserAmount
      transactionOps.push(
          prisma.rawUserAmount.update({
              where: { id: userRawAmount.id },
              data: { amount: { decrement: recipe.amount } }
          })
      );
      totalRawConsumed += recipe.amount;
  }

  // 4. Update/Create CraftUserAmount
  const existingCraftAmount = tradingData.craftUserAmounts.find(
      (cua) => cua.craftItemId === craftItemId
  );

  if (existingCraftAmount) {
      transactionOps.push(
          prisma.craftUserAmount.update({
              where: { id: existingCraftAmount.id },
              data: { amount: { increment: 1 } }
          })
      );
  } else {
      transactionOps.push(
          prisma.craftUserAmount.create({
              data: {
                  tradingDataId: tradingData.id,
                  craftItemId: craftItemId,
                  amount: 1
              }
          })
      );
  }

  // 5. Add Logs
  transactionOps.push(
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(-totalRawConsumed), // Just a simplistic count of total items? Or specific?
              // The schema says 'amount' corresponds to resource.
              // If resource is RAW, it might mean generic count.
              // For consistent logging with previous code:
              type: BalanceLogType.DEBIT,
              resource: BalanceTradingResource.RAW,
              message: `Consumed materials to craft ${craftItem.name}`,
          },
      })
  );

  transactionOps.push(
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(1),
              type: BalanceLogType.CREDIT,
              resource: BalanceTradingResource.CRAFT,
              message: `Crafted ${craftItem.name}`,
          },
      })
  );

  // 6. Execute Transaction
  try {
      await prisma.$transaction(transactionOps);

      // Return updated data
      const finalData = await prisma.tradingData.findUnique({
          where: { id: tradingData.id },
          include: {
              rawUserAmounts: { include: { rawItem: true } },
              craftUserAmounts: { include: { craftItem: true } },
              balanceTradingLogs: true,
          },
      });

      return {
          success: true,
          data: finalData!,
          message: `Successfully crafted ${craftItem.name}`,
      };

  } catch (error) {
      console.error("Crafting error:", error);
      return { success: false, error: "Failed to execute crafting transaction" };
  }
}
