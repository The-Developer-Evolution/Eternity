'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { TradingData } from "@prisma/client";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";
import { ActionResult } from "@/types/actionResult";
import prisma from "@/lib/prisma";
import { getRunningTradingPeriod } from "../action";

// admin bayar biaya masuk (variable amount)
export async function payPitchingFee(userId: string, amount: number): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (amount <= 0) {
        return { success: false, error: "Fee amount must be positive" };
    }

    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found" };
    }

    const tradingData = userResult.data.tradingData;
    const FEE = amount;

    // Check if user has already paid pitching fee
    if (tradingData.hadPitching) {
        return { success: false, error: "User has already paid the pitching fee" };
    }

    if (tradingData.eternites < FEE) {
        return { success: false, error: "Insufficient Eternites" };
    }

    try {
        const [] = await prisma.$transaction([
            prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(FEE), 
                    type: BalanceLogType.DEBIT, 
                    resource: BalanceTradingResource.ETERNITES, 
                    message: `Pay Pitching Fee (${FEE})`
                }
            }),
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: {
                    eternites: { decrement: FEE },
                    hadPitching: true  // Mark as having paid pitching fee
                }
            })
        ]);
        
        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: true,
                craftUserAmounts: true,
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData! };

    } catch (error) {
        console.error("Error paying pitching fee:", error);
        return { success: false, error: "Failed to process transaction" };
    }
}

// admin beri uang dari pitching (IDR or USD)
export async function givePitchingMoney(userId: string, amount: number, currency: 'IDR' | 'USD' = 'IDR'): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (amount <= 0) {
        return { success: false, error: "Amount must be positive" };
    }

    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found" };
    }

    const tradingData = userResult.data.tradingData;

    try {
        const resourceFn = currency === 'IDR' ? BalanceTradingResource.IDR : BalanceTradingResource.USD;
        const updateData = currency === 'IDR' ? { idr: { increment: BigInt(amount) } } : { usd: { increment: BigInt(amount) } };

        await prisma.$transaction([
            prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(amount),
                    type: BalanceLogType.CREDIT,
                    resource: resourceFn,
                    message: `Pitching Reward (${currency})`
                }
            }),
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: updateData
            })
        ]);

        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: true,
                craftUserAmounts: true,
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData! };

    } catch (error) {
         console.error("Error giving pitching money:", error);
        return { success: false, error: "Failed to process transaction" };
    }
}