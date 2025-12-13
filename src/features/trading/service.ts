'use server'

import prisma from "@/lib/prisma"
import { ActionResult } from "@/types/actionResult"
import { handlePrismaError } from "@/utils/prisma"
import { revalidatePath } from "next/cache"
import { AdminTradingRole, BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums"
import { checkUserRole } from "../auth/utils"
import { TradingData, User } from "@/generated/prisma/client"
import { RawMaterial } from "./types"
import { getRandomRawMaterial } from "./utils"
import { getUserTradingById } from "../user/trading.service"

// For Talkshow: add trading point to user
export async function addTradingPointToUser(userId: string, points: number): Promise<ActionResult<number>> {
    //   Check user role
    const result = await checkUserRole([AdminTradingRole.TALKSHOW]);
    if (!result.success) {
        console.log(result.error)
        return {
            success: false, error: result.error
        } 
    }
    
    try {
        const updatedTradingData = await prisma.tradingData.update({
            where: {
                userId: userId,
            },
            data: {
                point: {
                    increment: points,
                },
            },
        });

        revalidatePath('/');

        return {
            success: true,
            data: updatedTradingData.point,
            message: `Successfully added ${points} points.`,
        };

    } catch (error) {
        console.error("Error updating trading points:", error);
        // console.error("Error updating trading points:", handlePrismaError(error));
        return {
                success: false,
                error: handlePrismaError(error),
        };
    }
}


// Beli Raw Material

const MATERIAL_PRICE = 100;

export async function buyMaterial(
  userId: string,
  material: RawMaterial
): Promise<ActionResult<TradingData>> {

  // 1. Check user role
  const roleCheck = await checkUserRole([AdminTradingRole.SUPER]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  // 2. Fetch user + trading data
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
