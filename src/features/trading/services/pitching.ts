'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { TradingData } from "@/generated/prisma/client";
import { BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import { ActionResult } from "@/types/actionResult";
import prisma from "@/lib/prisma";

// admin bayar biaya masuk (15000 eternites)
export async function payPitchingFee(userId: string): Promise<ActionResult<TradingData>> {
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found" };
    }

    const tradingData = userResult.data.tradingData;
    const FEE = 15000;

    if (tradingData.eternites < FEE) {
        return { success: false, error: "Insufficient Eternites" };
    }

    try {
        const [, updatedTradingData] = await prisma.$transaction([
            prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(FEE), 
                    type: BalanceLogType.DEBIT, 
                    resource: BalanceTradingResource.ETERNITES, 
                    message: "Pay Pitching Fee"
                }
            }),
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: {
                    eternites: { decrement: FEE }
                }
            })
        ]);
        
        // Re-fetch to match return type structure if needed or just return updatedTradingData 
        // But transaction returns the result of the operation. 
        // tradingData.update returns the updated object.
        
        // However, usually we want to return the full object with relations if needed. 
        // But for now let's return what update returns, or refetch. 
        // Let's refetch to be safe and consistent with other services.
        
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

// admin beri uang dari pitching (IDR)
export async function givePitchingMoney(userId: string, amount: number): Promise<ActionResult<TradingData>> {
    if (amount <= 0) {
        return { success: false, error: "Amount must be positive" };
    }

    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found" };
    }

    const tradingData = userResult.data.tradingData;

    try {
        await prisma.$transaction([
            prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(amount),
                    type: BalanceLogType.CREDIT,
                    resource: BalanceTradingResource.IDR,
                    message: "Pitching Reward"
                }
            }),
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: {
                    idr: { increment: BigInt(amount) }
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
         console.error("Error giving pitching money:", error);
        return { success: false, error: "Failed to process transaction" };
    }
}