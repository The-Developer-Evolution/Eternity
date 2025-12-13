'use server'

import { checkUserRole } from "@/features/auth/utils";
import { getUserTradingById } from "@/features/user/trading.service";
import { AdminTradingRole, BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import { ActionResult } from "@/types/actionResult";
import { CraftItem, CraftItemKey, RawMaterial, RECIPES } from "../types";
import { TradingData } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { countMaterials, matchRecipe } from "../utils";


export async function itemToCraft(
  userId: string,
  craftItem: CraftItemKey
): Promise<ActionResult<TradingData>> {

  // 1. Role check
  const roleCheck = await checkUserRole([AdminTradingRole.CRAFT, AdminTradingRole.SUPER]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  // 2. Get user trading data
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found" };
  }

  const tradingData = userResult.data.tradingData;

  // 3. Find recipe
  const recipe = RECIPES.find(r => r.output === craftItem);
  if (!recipe) {
    return { success: false, error: "Recipe not found" };
  }

  // 4. Check inventory & collect raw item IDs
  const rawItemIdsToConsume: string[] = [];
  let totalConsumed = 0;

    for (const [material, qty] of Object.entries(recipe.input) as [
        RawMaterial,
        number
    ][]) {
        const items = await prisma.rawItem.findMany({
            where: {
                tradingDataId: tradingData.id,
                name: material,
            },
        take: qty,
        });

    if (items.length < qty) {
      return {
        success: false,
        error: `Not enough ${material}`,
      };
    }

    rawItemIdsToConsume.push(...items.map(i => i.id));
    totalConsumed += qty;
  }

  // 5. Transaction (atomic)
  const [, , , , updatedTradingData] = await prisma.$transaction([
    // delete raw materials
    prisma.rawItem.deleteMany({
      where: { id: { in: rawItemIdsToConsume } },
    }),

    // create crafted item
    prisma.craftItem.create({
      data: {
        tradingDataId: tradingData.id,
        name: craftItem,
      },
    }),

    // debit log (ALL consumed materials)
    prisma.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(-totalConsumed),
        type: BalanceLogType.DEBIT,
        resource: BalanceTradingResource.RAW,
        message: `Consumed materials to craft ${craftItem}`,
      },
    }),

    // credit log (crafted item)
    prisma.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(1),
        type: BalanceLogType.CREDIT,
        resource: BalanceTradingResource.CRAFT,
        message: `Crafted ${craftItem}`,
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
    message: `Successfully crafted ${craftItem}`,
  };
}