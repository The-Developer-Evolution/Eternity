'use server'

import { BalanceLogType, BalanceTradingResource, TradingData } from "@/generated/prisma/client";
import { RawMaterial } from "../types/craft";
import { ActionResult } from "@/types/actionResult";
import { getUserTradingById } from "@/features/user/trading.service";
import prisma from "@/lib/prisma";

const MATERIAL_PRICE = 100;

// Beli Raw Material
export async function buyMaterial(
  userId: string,
  material: RawMaterial
): Promise<ActionResult<TradingData>> {
  const buyer = await getUserTradingById(userId);
  if (!buyer.success || !buyer.data?.tradingData) {
    return { success: false, error: "User or trading data not found" };
  }

  const tradingData = buyer.data.tradingData;

  // 3. Check balance
  if (tradingData.eternites < MATERIAL_PRICE) {
    return { success: false, error: "Insufficient balance" };
  }

  // 4. Atomic transaction
  const [updatedTradingData] = await prisma.$transaction([
    // A. Decrement eternites
    prisma.tradingData.update({
      where: { userId },
      data: {
        eternites: {
          decrement: MATERIAL_PRICE,
        },
      },
    }),

    // B. Create raw material
    prisma.rawItem.create({
      data: {
        tradingDataId: tradingData.id,
        name: material,
      },
    }),

    // C. Log eternites deduction
    prisma.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(-MATERIAL_PRICE),
        message: `Spent ${MATERIAL_PRICE} eternites to buy raw material`,
        type: BalanceLogType.DEBIT,
        resource: BalanceTradingResource.ETERNITES,
      },
    }),

    // D. Log raw material acquisition
    prisma.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(1),
        message: `Acquired raw material: ${material}`,
        type: BalanceLogType.CREDIT,
        resource: BalanceTradingResource.RAW,
      },
    }),
  ]);

  return {
    success: true,
    data: updatedTradingData,
    message: `Successfully bought ${material}`,
  };
}
