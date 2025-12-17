'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import {  BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@/generated/prisma/client";
import { getRunningTradingPeriod } from "../action";

export async function getAllMapRecipes() {
    return await prisma.mapRecipe.findMany({
        include: {
            mapRecipeComponents: {
                include: {
                    craftItem: true
                }
            }
        }
    });
}

export async function craftToMap(
  userId: string,
  mapRecipeId: string,
  amount: number = 1
): Promise<ActionResult<TradingData>> {

    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

  if (amount <= 0) return { success: false, error: "Amount must be positive" };

  // 1. Get user trading data
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found" };
  }

  const tradingData = userResult.data.tradingData;

  // 2. Get Recipe
  const recipe = await prisma.mapRecipe.findUnique({
      where: { id: mapRecipeId },
      include: {
          mapRecipeComponents: {
              include: { craftItem: true }
          }
      }
  });

  if (!recipe) {
      return { success: false, error: "Recipe not found." };
  }

  // 3. Check Inventory & Prepare Transaction
  const ops: any[] = [];
  let totalItemsConsumed = 0;

  for (const component of recipe.mapRecipeComponents) {
      const requiredAmount = BigInt(component.amount) * BigInt(amount);
      const userItem = tradingData.craftUserAmounts.find(u => u.craftItemId === component.craftItemId);

      if (!userItem || userItem.amount < requiredAmount) {
          return {
              success: false,
              error: `Insufficient ${component.craftItem.name}. Required: ${requiredAmount}, Available: ${userItem?.amount || 0}`
          };
      }

      // Add decrement op
      ops.push(prisma.craftUserAmount.update({
          where: { id: userItem.id },
          data: { amount: { decrement: requiredAmount } }
      }));
      
      totalItemsConsumed += Number(requiredAmount); // Approx for log
  }

  // 4. Add Map & Log
  ops.push(
      prisma.tradingData.update({
          where: { id: tradingData.id },
          data: { map: { increment: amount } }
      }),
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(-totalItemsConsumed), // Just a simplistic log, better to log credited Map separately? Existing logic logged debit & credit.
              type: BalanceLogType.DEBIT,
              resource: BalanceTradingResource.CRAFT,
              message: `Consumed items for ${amount} Map(s)`
          }
      }),
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(amount),
              type: BalanceLogType.CREDIT,
              resource: BalanceTradingResource.MAP,
              message: `Crafted ${amount} Map(s)`
          }
      })
  );

  try {
      await prisma.$transaction(ops);

      const finalData = await prisma.tradingData.findUnique({
          where: { id: tradingData.id },
          include: {
              rawUserAmounts: { include: { rawItem: true } },
              craftUserAmounts: { include: { craftItem: true } },
              balanceTradingLogs: true,
          },
      });

      return { success: true, data: finalData!, message: `Successfully crafted ${amount} Map(s)` };

  } catch (error) {
      console.error("Craft Map Error", error);
      return { success: false, error: "Transaction failed" };
  }
}
