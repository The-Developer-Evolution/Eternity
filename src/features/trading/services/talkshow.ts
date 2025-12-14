'use server'

import prisma from "@/lib/prisma"
import { ActionResult } from "@/types/actionResult"
import { handlePrismaError } from "@/utils/prisma"
import { revalidatePath } from "next/cache"
import { BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums"

// For Talkshow: add trading point to user
export async function addTradingPointToUser(userId: string, points: number): Promise<ActionResult<number>> {
    
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


