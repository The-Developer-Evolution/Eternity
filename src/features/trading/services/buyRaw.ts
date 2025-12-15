'use server'

import { BalanceLogType, BalanceTradingResource, TradingData } from "@/generated/prisma/client";
import { RawMaterial } from "../types/craft";
import { ActionResult } from "@/types/actionResult";
import { getUserTradingById } from "@/features/user/trading.service";
import prisma from "@/lib/prisma";

const MATERIAL_PRICE = 100;

// Beli Raw Material
// Beli Raw Material
export async function buyMaterial(
  userId: string,
  rawItemId: string,
  amount: number
): Promise<ActionResult<TradingData>> {
  if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
  }

  console.log("BUY MATERIAL search for : ", userId);
  const buyer = await getUserTradingById(userId);
  if (!buyer.success || !buyer.data?.tradingData) {
    return { success: false, error: "User or trading data not found" };
  }

  const tradingData = buyer.data.tradingData;

  // 1. Check raw item exists (seeded)
  const rawItem = await prisma.rawItem.findUnique({
    where: { id: rawItemId },
  });

  if (!rawItem) {
    return { success: false, error: `Raw material not found` };
  }

  const materialName = rawItem.name;
  const priceFn = Number(rawItem.price);
  const totalPrice = priceFn * amount;

  // 2. Check balance
  if (tradingData.eternites < totalPrice) {
    return { success: false, error: "Insufficient balance" };
  }

  // 3. Atomic transaction with Interactive Transaction
  return await prisma.$transaction(async (tx) => {
    // A. Decrement balance
    const updatedUser = await tx.tradingData.update({
      where: { userId },
      data: {
        eternites: {
          decrement: totalPrice,
        },
      },
    });

    // B. Find existing UserRawAmount
    const existingAmount = await tx.rawUserAmount.findFirst({
      where: {
        tradingDataId: tradingData.id,
        rawItemId: rawItem.id,
      },
    });

    if (existingAmount) {
      await tx.rawUserAmount.update({
        where: { id: existingAmount.id },
        data: {
          amount: { increment: amount },
        },
      });
    } else {
      await tx.rawUserAmount.create({
        data: {
          tradingDataId: tradingData.id,
          rawItemId: rawItem.id,
          amount: amount,
        },
      });
    }

    // C. Logs
    await tx.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(-totalPrice),
        message: `Spent ${totalPrice} eternites to buy ${amount}x ${materialName}`,
        type: BalanceLogType.DEBIT,
        resource: BalanceTradingResource.ETERNITES,
      },
    });

     await tx.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(amount),
        message: `Acquired ${amount}x raw material: ${materialName}`,
        type: BalanceLogType.CREDIT,
        resource: BalanceTradingResource.RAW,
      },
    });

    return {
      success: true,
      data: updatedUser,
      message: `Successfully bought ${amount}x ${materialName}`,
    };
  });
}
