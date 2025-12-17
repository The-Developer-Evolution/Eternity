'use server'

import { TradingData } from "@/generated/prisma/client";
import { BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { getRunningTradingPeriod } from "../action";

export async function updateThunt(userId: string): Promise<ActionResult<TradingData>> {
    // Game Running Check
    const period = await getRunningTradingPeriod();
    if (!period) return { success: false, error: "The game is PAUSED" };

    const tradingData = await prisma.tradingData.findUnique({ where: { userId } });
    if (!tradingData) {
        return { success: false, error: 'Trading data not found' };
    }

    if (tradingData.isPlayedThunt) {
        return { success: false, error: 'User already played' };
    }


    // update isPlayedThunt to true
    const updatedTradingData = await prisma.tradingData.update({
        where: { userId },
        data: { isPlayedThunt: true }
    });

    return { success: true, data: updatedTradingData };
}

export async function getAllRawItems() {
    return await prisma.rawItem.findMany();
}

export async function addThuntItem(userId: string, rawItemName: string, amount: number = 1): Promise<ActionResult<TradingData>>{
    // Game Running Check
    const period = await getRunningTradingPeriod();
    if (!period) return { success: false, error: "The game is PAUSED" };

    const tradingData = await prisma.tradingData.findUnique({ 
        where: { userId },
        include: { rawUserAmounts: true }
    });
    
    if (!tradingData) {
        return { success: false, error: 'Trading data not found' };
    }

    if (tradingData.itemFromThunt + amount > 10) {
        return { success: false, error: `Limit reached. Current: ${tradingData.itemFromThunt}, Max: 10. Cannot add ${amount}.` };
    }

    // Find the master RawItem
    const rawItemMaster = await prisma.rawItem.findFirst({
        where: { name: rawItemName }
    });

    if (!rawItemMaster) {
        return { success: false, error: "Raw item not found" };
    }

    // add item for the targeted userId
    try {
        const ops: any[] = [];
        
        // 1. Update/Create RawUserAmount
        const existing = tradingData.rawUserAmounts.find(r => r.rawItemId === rawItemMaster.id);
        
        if (existing) {
            ops.push(prisma.rawUserAmount.update({
                where: { id: existing.id },
                data: { amount: { increment: amount } }
            }));
        } else {
            ops.push(prisma.rawUserAmount.create({
                data: {
                    tradingDataId: tradingData.id,
                    rawItemId: rawItemMaster.id,
                    amount: amount
                }
            }));
        }

        // 2. Increment itemFromThunt counter
        ops.push(prisma.tradingData.update({
            where: { id: tradingData.id },
            data: {
                itemFromThunt: { increment: amount }
            }
        }));

        // 3. Log
        ops.push(prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(amount),
                type: BalanceLogType.CREDIT,
                resource: BalanceTradingResource.RAW,
                message: `Thunt reward: ${amount}x ${rawItemName}`
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
        return { success: false, error: "Failed to add item" };
    }
}
