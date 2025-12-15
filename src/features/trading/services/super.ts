'use server'

import { ActionResult } from "@/types/actionResult";
import prisma from "@/lib/prisma";
import { GameStatus } from "@/generated/prisma/enums";
import { BalanceTradingLog, MasterTrading } from "@/generated/prisma/client";
import { getUserTradingById } from "@/features/user/trading.service";

export async function getTransactionByUserId(userId: string): Promise<ActionResult<BalanceTradingLog[]>>{
    try {
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

export async function setStatusTrading(status: GameStatus): Promise<ActionResult<MasterTrading>>{
    try {

        const masterTrading = await prisma.masterTrading.findFirst();
        if (!masterTrading) {
            return { success: false, error: "Master trading not found" };
        }

        let updateData: any = { status };

        // If starting
        if (status === GameStatus.RUNNING && masterTrading.status !== GameStatus.RUNNING) {
            updateData.lastStartedAt = new Date();
        } 
        // If pausing
        else if (status === GameStatus.PAUSED && masterTrading.status === GameStatus.RUNNING) {
            if (masterTrading.lastStartedAt) {
                const now = new Date();
                const diffInSeconds = Math.floor((now.getTime() - masterTrading.lastStartedAt.getTime()) / 1000);
                updateData.elapsed = (masterTrading.elapsed || 0) + diffInSeconds;
                updateData.lastStartedAt = null; 
            }
        }

        const updatedMasterTrading = await prisma.masterTrading.update({
            where: { id: masterTrading.id },
            data: updateData
        });

        return { success: true, data: updatedMasterTrading };
    } catch (error) {
        console.error("Error pausing trading:", error);
        return { success: false, error: "Failed to pause trading" };
    }
}