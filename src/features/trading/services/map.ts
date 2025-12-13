'use server'

import { checkUserRole } from "@/features/auth/utils";
import { getUserTradingById } from "@/features/user/trading.service";
import { AdminTradingRole, BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { CraftItemKey } from "../types/craft";
import { MAP_RECIPES } from "../types/map";
import { TradingData } from "@/generated/prisma/client";

export async function craftToMap(
  userId: string,
  crafts: CraftItemKey[]
): Promise<ActionResult<TradingData>> {

  // 1. Role check
  const roleCheck = await checkUserRole([AdminTradingRole.MAP, AdminTradingRole.SUPER]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  // 2. Get user trading data
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found" };
  }

  const tradingData = userResult.data.tradingData;

  // 3. Find recipe based on input keys
  // distinct keys from input
  const inputKeys = Array.from(new Set(crafts));

  const recipe = MAP_RECIPES.find(r => {
    const recipeKeys = Object.keys(r.input) as CraftItemKey[];
    if (recipeKeys.length !== inputKeys.length) return false;
    // check if all keys present
    return recipeKeys.every(k => inputKeys.includes(k));
  });

  if (!recipe) {
    return { success: false, error: "Recipe not found for these ingredients" };
  }

  // 4. Check inventory & collect item IDs
  const craftItemIdsToConsume: string[] = [];
  let totalItemsToConsume = 0;
  
  for (const [itemKey, qty] of Object.entries(recipe.input) as [CraftItemKey, number][]) {
    const items = await prisma.craftItem.findMany({
      where: {
        tradingDataId: tradingData.id,
        name: itemKey,
      },
      take: qty,
    });

    if (items.length < qty) {
      return {
        success: false,
        error: `Not enough ${itemKey} (Required: ${qty})`,
      };
    }

    craftItemIdsToConsume.push(...items.map(i => i.id));
    totalItemsToConsume += qty;
  }

  // 5. Transaction
  const [, , , , updatedTradingData] = await prisma.$transaction([
    // delete craft items
    prisma.craftItem.deleteMany({
      where: { id: { in: craftItemIdsToConsume } },
    }),

    // update map count
    prisma.tradingData.update({
        where: { id: tradingData.id },
        data: {
            map: { increment: 1 }
        }
    }),

    // debit log (consumed items)
    prisma.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(-totalItemsToConsume),
        type: BalanceLogType.DEBIT,
        resource: BalanceTradingResource.CRAFT, 
        message: `Consumed items to craft Map`,
      },
    }),

    // credit log (Map)
    prisma.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(1),
        type: BalanceLogType.CREDIT,
        resource: BalanceTradingResource.MAP,
        message: `Crafted 1 Map`,
      },
    }),

    // return updated data
    prisma.tradingData.findUnique({
      where: { id: tradingData.id },
      include: {
        rawItems: true,
        craftItems: true,
        balanceTradingLogs: true,
      },
    }),
  ]);

  return {
    success: true,
    data: updatedTradingData!,
    message: "Successfully crafted Map",
  };
}
