'use server'

import prisma from "@/lib/prisma";
import { getRunningTradingPeriod } from "../action";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";
import { TradingData } from "@prisma/client";
import { ActionResult } from "@/types/actionResult";

export async function chargeEternities(userId: string, amount: number, reason: string = "Exclusive News"): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod();
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (amount <= 0) {
        return { success: false, error: "Amount must be positive" };
    }

    const tradingData = await prisma.tradingData.findUnique({ where: { userId } });
    if (!tradingData) {
        return { success: false, error: 'Trading data not found' };
    }

    if (tradingData.eternites < BigInt(amount)) {
        return { success: false, error: "Insufficient Eternities" };
    }

    try {
        const ops = [];
        
        // 1. Update eternites
        ops.push(prisma.tradingData.update({
            where: { id: tradingData.id },
            data: {
                eternites: { decrement: amount }
            }
        }));

        // 2. Log
        ops.push(prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(amount),
                type: BalanceLogType.DEBIT,
                resource: BalanceTradingResource.ETERNITES,
                message: reason
            }
        }));

        await prisma.$transaction(ops);

        // Return updated data
        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: { include: { rawItem: true } },
                craftUserAmounts: { include: { craftItem: true } },
                balanceTradingLogs: true,
            },
        });
        
        return { success: true, data: finalData! };

    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to charge eternities" };
    }
}
