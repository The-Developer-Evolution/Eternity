'use server'

import { checkUserRole } from "@/features/auth/utils";
import { TradingData } from "@/generated/prisma/client";
import { AdminTradingRole, BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { RawMaterial } from "../types/craft";


export async function updateThunt(userId: string): Promise<ActionResult<TradingData>> {
    // role check
    const roleCheck = await checkUserRole([AdminTradingRole.THUNT, AdminTradingRole.SUPER]);
    if (!roleCheck.success) {
        return { success: false, error: roleCheck.error };
    }

    const tradingData = await prisma.tradingData.findUnique({ where: { userId } });
    if (!tradingData) {
        return { success: false, error: 'Trading data not found' };
    }

    // update isPlayedThunt to true
    const updatedTradingData = await prisma.tradingData.update({
        where: { userId },
        data: { isPlayedThunt: true }
    });

    return { success: true, data: updatedTradingData };
}



export async function addThuntItem(userId: string, rawItem: RawMaterial): Promise<ActionResult<TradingData>>{
    // role check
    const roleCheck = await checkUserRole([AdminTradingRole.THUNT, AdminTradingRole.SUPER]);
    if (!roleCheck.success) {
        return { success: false, error: roleCheck.error };
    }

    const tradingData = await prisma.tradingData.findUnique({ where: { userId } });
    if (!tradingData) {
        return { success: false, error: 'Trading data not found' };
    }

    if (tradingData.itemFromThunt >= 10) {
        return { success: false, error: "Maximum Thunt items reached (10)" };
    }

    // add 1 item for the targeted userId
    try {
        await prisma.$transaction([
            prisma.rawItem.create({
                data: {
                    tradingDataId: tradingData.id,
                    name: rawItem
                }
            }),
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: {
                    itemFromThunt: { increment: 1 }
                }
            }),
            prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(1),
                    type: BalanceLogType.CREDIT,
                    resource: BalanceTradingResource.RAW,
                    message: `Thunt reward: ${rawItem}`
                }
            })
        ]);

        // Return updated data
        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawItems: true,
                craftItems: true,
                balanceTradingLogs: true,
            },
        });
        
        return { success: true, data: finalData! };

    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to add item" };
    }
}