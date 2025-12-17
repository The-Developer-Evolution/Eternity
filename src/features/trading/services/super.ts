'use server'

import { ActionResult } from "@/types/actionResult";
import prisma from "@/lib/prisma";
import { GameStatus } from "@/generated/prisma/enums";
import { BalanceTradingLog, MasterTrading } from "@/generated/prisma/client";
import { getUserTradingById } from "@/features/user/trading.service";
import { getRunningTradingPeriod } from "../action";

export async function getTransactionByUserId(userId: string): Promise<ActionResult<BalanceTradingLog[]>>{
    try {
        // Game Running Check
        const period = await getRunningTradingPeriod();
        if (!period) return { success: false, error: "The game is PAUSED" };

        const userResult = await getUserTradingById(userId);
        if (!userResult.success || !userResult.data?.tradingData) {
            return { success: false, error: "User or trading data not found" };
        }
        
        const tradingData = userResult.data.tradingData;

        const transactions = await prisma.balanceTradingLog.findMany({ 
            where: { tradingDataId: tradingData.id },
            orderBy: {
                createdAt: "desc"
            } 
        });
        
        return { success: true, data: transactions };
    } catch (error) {
        console.error("Error getting transactions:", error);
        return { success: false, error: "Failed to fetch transactions" };
    }
}