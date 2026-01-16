'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@prisma/client";
import { getActiveTradingPeriod } from "./timer";
import { getRunningTradingPeriod } from "../action";


export interface SellItem {
  id: string;
  name: string;
  price: number;
}

export async function getSellableItems(): Promise<{ rawItems: SellItem[], craftItems: SellItem[] }> {
    const activePeriod = await prisma.periodeTrading.findFirst({
        where: { status: "ON_GOING" }
    });

    const rawItems = await prisma.rawItem.findMany({
        include: {
            rawPeriods: {
                where: { periode: activePeriod ? activePeriod.periode : -1 }
            }
        }
    });

    const craftItems = await prisma.craftItem.findMany({
        include: {
            craftPeriods: {
                where: { periode: activePeriod ? activePeriod.periode : -1 }
            }
        }
    });

    return {
        rawItems: rawItems.map(i => ({
            id: i.id,
            name: i.name,
            price: Number(i.rawPeriods[0]?.price || 0)
        })),
        craftItems: craftItems.map(i => ({
            id: i.id,
            name: i.name,
            price: Number(i.craftPeriods[0]?.price || 0)
        }))
    };
}



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


export type SellItemPayload = {
    type: "RAW" | "CRAFT" | "MAP";
    id: string; // 'MAP' for map
    amount: number;
}

export async function sellItems(
  userId: string,
  items: SellItemPayload[]
): Promise<ActionResult<TradingData>> {

    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (items.length === 0) return { success: false, error: "No items to sell." };

    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found." };
    }
    const tradingData = userResult.data.tradingData;

    try {
        const ops: any[] = [];
        let totalIDR = BigInt(0);
        let totalEternites = BigInt(0);

        const mapPrice = BigInt(await getMapPrice());

        for (const item of items) {
             if (item.amount <= 0) continue;
             
             let itemPrice = BigInt(0);
             let itemName = "";
             let transactionTotal = BigInt(0);
             let logResource: BalanceTradingResource;
             
             if (item.type === 'MAP') {
                 if (tradingData.map < item.amount) {
                      return { success: false, error: `Insufficient Map. Owned: ${tradingData.map}` };
                 }
                 itemPrice = mapPrice;
                 itemName = "Map";
                 logResource = BalanceTradingResource.MAP;
                 
                 ops.push(prisma.tradingData.update({
                    where: { id: tradingData.id },
                    data: { map: { decrement: item.amount } }
                }));
                
                transactionTotal = itemPrice * BigInt(item.amount);
                totalIDR += transactionTotal;

             } else if (item.type === 'RAW') {
                 const rawUserAmount = tradingData.rawUserAmounts.find(i => i.rawItemId === item.id);
                 if (!rawUserAmount || rawUserAmount.amount < BigInt(item.amount)) {
                    return { success: false, error: `Insufficient RAW item (ID: ${item.id}).` };
                 }
                 
                 const itemDef = await prisma.rawItem.findUnique({ where: { id: item.id } });
                 if (!itemDef) return { success: false, error: `Raw Item ${item.id} not found` };
                 
                 // Fetch price from RawPeriod
                 const rawPeriod = await prisma.rawPeriod.findFirst({
                    where: {
                        rawId: item.id,
                        periode: period.periode
                    }
                 });
                 if (!rawPeriod) return { success: false, error: `Price for ${itemDef.name} not found in current period` };
                 
                 itemPrice = rawPeriod.price;
                 itemName = itemDef.name;
                 logResource = BalanceTradingResource.RAW;

                 ops.push(prisma.rawUserAmount.update({
                    where: { id: rawUserAmount.id },
                    data: { amount: { decrement: item.amount } }
                }));

                transactionTotal = itemPrice * BigInt(item.amount);
                totalEternites += transactionTotal;

             } else if (item.type === 'CRAFT') {
                 const craftUserAmount = tradingData.craftUserAmounts.find(i => i.craftItemId === item.id);
                 if (!craftUserAmount || craftUserAmount.amount < BigInt(item.amount)) {
                    return { success: false, error: `Insufficient CRAFT item (ID: ${item.id}).` };
                 }

                 const itemDef = await prisma.craftItem.findUnique({ where: { id: item.id } });
                 if (!itemDef) return { success: false, error: `Craft Item ${item.id} not found` };

                 // Fetch price from CraftPeriod
                 const craftPeriod = await prisma.craftPeriod.findFirst({
                    where: {
                        craftId: item.id,
                        periode: period.periode
                    }
                 });
                 if (!craftPeriod) return { success: false, error: `Price for ${itemDef.name} not found in current period` };

                 itemPrice = craftPeriod.price;
                 itemName = itemDef.name;
                 logResource = BalanceTradingResource.CRAFT;

                  ops.push(prisma.craftUserAmount.update({
                    where: { id: craftUserAmount.id },
                    data: { amount: { decrement: item.amount } }
                }));

                transactionTotal = itemPrice * BigInt(item.amount);
                totalEternites += transactionTotal;
             } else {
                 continue; 
             }

             // Create Log per resource
             ops.push(prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: transactionTotal,
                    type: BalanceLogType.CREDIT,
                    resource: logResource!, 
                    message: `Sold ${item.amount}x ${itemName} for ${transactionTotal} ${item.type === 'MAP' ? 'IDR' : 'Eternites'}`
                }
            }));
        }
        
        // Credit Balance (Aggregated)
        if (totalIDR > 0) {
             ops.push(prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { idr: { increment: totalIDR } }
            }));
        }

        if (totalEternites > 0) {
             ops.push(prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { eternites: { increment: Number(totalEternites) } }
            }));
        }
        
        await prisma.$transaction(ops);

         const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: { include: { rawItem: true } },
                craftUserAmounts: { include: { craftItem: true } },
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData!, message: "Bulk transaction successful" };

    } catch (e) {
        console.error("Sell Error", e);
        return { success: false, error: "Transaction failed." };
    }
}