'use server'

import { TradingData } from "@prisma/client";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";
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

    // CHECK BALANCE
    const PRICE = 100;
    if (tradingData.eternites < PRICE) {
        return { success: false, error: `Insufficient Eternities. Required: ${PRICE}, Available: ${tradingData.eternites}` };
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Deduct Balance & Update Status
            const updatedTradingData = await tx.tradingData.update({
                where: { userId },
                data: { 
                    isPlayedThunt: true,
                    eternites: { decrement: PRICE }
                }
            });

            // 2. Log Transaction
            await tx.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(PRICE),
                    type: BalanceLogType.DEBIT,
                    resource: BalanceTradingResource.ETERNITES,
                    message: `Treasure Hunt Participation Fee`
                }
            });

            return updatedTradingData;
        });

        return { success: true, data: result };

    } catch (error) {
        console.error("Update Thunt Error: ", error);
        return { success: false, error: "Failed to update status and charge user." };
    }
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
        const ops = [];
        
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


export async function giveEternityRewards(userId: string, amount: number): Promise<ActionResult<TradingData>> {
    // Game Running Check
    const period = await getRunningTradingPeriod();
    if (!period) return { success: false, error: "The game is PAUSED" };

    const tradingData = await prisma.tradingData.findUnique({ where: { userId } });
    if (!tradingData) {
        return { success: false, error: 'Trading data not found' };
    }

    try {
        const ops = [];
        
        // 1. Update eternites
        ops.push(prisma.tradingData.update({
            where: { id: tradingData.id },
            data: {
                eternites: { increment: amount }
            }
        }));

        // 2. Log
        ops.push(prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(amount),
                type: BalanceLogType.CREDIT,
                resource: BalanceTradingResource.ETERNITES,
                message: `Thunt reward: ${amount} Eternities`
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
        return { success: false, error: "Failed to add eternities" };
    }
}

