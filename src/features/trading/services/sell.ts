'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { BalanceLogType, BalanceTradingResource, RallyPeriodStatus } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@/generated/prisma/client";

export async function getSellableItems() {
    const [rawItems, craftItems] = await Promise.all([
        prisma.rawItem.findMany(),
        prisma.craftItem.findMany()
    ]);
    return { rawItems, craftItems };
}

import { getActiveTradingPeriod } from "./timer";
import { getRunningTradingPeriod } from "../action";

export async function getMapPrice() {
    const activePeriod = await getActiveTradingPeriod();
    return activePeriod?.price_map || 0;
}

// Helper for UI to fetch specific inventory
export async function getUserInventory(userId: string) {
    const data = await prisma.tradingData.findUnique({
        where: { userId },
        include: {
            rawUserAmounts: true,
            craftUserAmounts: true,
        }
    });

    return data;
}

export async function sellItem(
  userId: string,
  itemType: "RAW" | "CRAFT" | "MAP",
  itemId: string | null, // null for MAP
  amount: number
): Promise<ActionResult<TradingData>> {

    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (amount <= 0) return { success: false, error: "Amount must be positive." };

    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found." };
    }
    const tradingData = userResult.data.tradingData;

    try {
        const ops: any[] = [];
        let logMessage = "";
        let logAmount = BigInt(0);
        let logResource: BalanceTradingResource;
        let isIdrTransaction = false;
        let transactionTotal = BigInt(0);

        if (itemType === "MAP") {
            // SELL MAP (IDR)
            if (tradingData.map < amount) {
                return { success: false, error: `Insufficient Map. Owned: ${tradingData.map}` };
            }

            const mapPrice = BigInt(await getMapPrice());
            transactionTotal = mapPrice * BigInt(amount);
            isIdrTransaction = true;

            // 1. Deduct Map
             ops.push(prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { map: { decrement: amount } }
            }));
            
            logMessage = `Sold ${amount} Map(s) for IDR ${transactionTotal}`;
            logResource = BalanceTradingResource.MAP;

        } else if (itemType === "RAW") {
            // SELL RAW (ETERNITES)
            if (!itemId) return { success: false, error: "Item ID required for RAW item." };
            
            const rawUserAmount = tradingData.rawUserAmounts.find(i => i.rawItemId === itemId);
            if (!rawUserAmount || rawUserAmount.amount < BigInt(amount)) {
                return { success: false, error: `Insufficient item amount.` };
            }
            
            const itemDef = await prisma.rawItem.findUnique({ where: { id: itemId } });
            if (!itemDef) return { success: false, error: "Item definition not found." };

            transactionTotal = itemDef.price * BigInt(amount);

             // 1. Deduct Raw Item
            ops.push(prisma.rawUserAmount.update({
                where: { id: rawUserAmount.id },
                data: { amount: { decrement: amount } }
            }));

            logMessage = `Sold ${amount}x ${itemDef.name} for ${transactionTotal} Eternites`;
            logResource = BalanceTradingResource.RAW;


        } else if (itemType === "CRAFT") {
             // SELL CRAFT (ETERNITES)
            if (!itemId) return { success: false, error: "Item ID required for CRAFT item." };

            const craftUserAmount = tradingData.craftUserAmounts.find(i => i.craftItemId === itemId);
             if (!craftUserAmount || craftUserAmount.amount < BigInt(amount)) {
                return { success: false, error: `Insufficient item amount.` };
            }

            const itemDef = await prisma.craftItem.findUnique({ where: { id: itemId } });
            if (!itemDef) return { success: false, error: "Item definition not found." };

            transactionTotal = itemDef.price * BigInt(amount);

            // 1. Deduct Craft Item
            ops.push(prisma.craftUserAmount.update({
                where: { id: craftUserAmount.id },
                data: { amount: { decrement: amount } }
            }));

            logMessage = `Sold ${amount}x ${itemDef.name} for ${transactionTotal} Eternites`;
            logResource = BalanceTradingResource.CRAFT;

        } else {
            return { success: false, error: "Invalid item type." };
        }

        // 2. Credit Currency
        if (isIdrTransaction) {
             ops.push(prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { idr: { increment: transactionTotal } }
            }));
        } else {
             // Eternites is Int, need check overflow? 
             // Using increment with simple Int might overflow if price is BigInt. 
             // Schema says Eternites is Int, prices are BigInt.
             // We must cast to Number for Eternites update, assuming it fits.
             // OR update schema? Proceeding with Number cast for now as typical Eternites logic.
             
             ops.push(prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { eternites: { increment: Number(transactionTotal) } }
            }));
        }

        // 3. Log
        ops.push(prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: transactionTotal,
                type: BalanceLogType.CREDIT,
                resource: isIdrTransaction ? BalanceTradingResource.IDR : logResource!, 
                message: logMessage
            }
        }));


        await prisma.$transaction(ops);

         const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: { include: { rawItem: true } },
                craftUserAmounts: { include: { craftItem: true } },
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData!, message: "Transaction successful" };


    } catch (e) {
        console.error("Sell Error", e);
        return { success: false, error: "Transaction failed." };
    }
}
