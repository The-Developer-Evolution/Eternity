'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getActiveTradingPeriod } from "./timer";
import { getRunningTradingPeriod } from "../action";

export type BlackMarketItemDetail = {
  id: string; // The StockPeriod ID (Primary Key of StockPeriod tables)
  itemId: string; // The Raw/Craft Item ID
  name: string;
  stock: number;
  price: number; // Cast BigInt to number for UI
  type: 'RAW' | 'CRAFT';
};

// function to pay cost blackmarket fee (for entering blackmarket station (ticket fee))
export async function payBlackMarketFee(userId: string): Promise<ActionResult<TradingData>> {
  const period = await getRunningTradingPeriod()
  if (!period) return { success: false, error: "The game is PAUSED" };
  
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found." };
  }
  const tradingData = userResult.data.tradingData;

  // Deduct Blackmarket Fee
  const blackmarketFee = BigInt(20000);
  if (tradingData.eternites < Number(blackmarketFee)) {
    return { success: false, error: "Insufficient Eternites for Blackmarket Fee." };
  }

  try {
    const ops = [
      prisma.tradingData.update({
        where: { id: tradingData.id },
        data: { eternites: { decrement: Number(blackmarketFee) } }
      }),
      prisma.balanceTradingLog.create({
        data: {
          tradingDataId: tradingData.id,
          amount: blackmarketFee,
          type: BalanceLogType.DEBIT,
          resource: BalanceTradingResource.ETERNITES,
          message: "Blackmarket Fee"
        }
      })
    ];

    await prisma.$transaction(ops);
    return { success: true, data: tradingData };
  } catch (error) {
    console.error("Error deducting Blackmarket Fee:", error);
    return { success: false, error: "Failed to deduct Blackmarket Fee." };
  }
}

// Fetch items available in the CURRENT ACTIVE period
export async function getBlackMarketItems(): Promise<BlackMarketItemDetail[]> {
  const activePeriod = await getActiveTradingPeriod();
  if (!activePeriod) return [];

  const [rawStocks, craftStocks] = await Promise.all([
    prisma.rawStockPeriod.findMany({
      where: { periode: activePeriod.periode },
      include: { rawItem: true },
    }),
    prisma.craftStockPeriod.findMany({
      where: { periode: activePeriod.periode },
      include: { craftItem: true },
    }),
  ]);

  const items: BlackMarketItemDetail[] = [];

  rawStocks.forEach((s) => {
    items.push({
      id: s.id,
      itemId: s.rawId,
      name: s.rawItem.name,
      stock: s.stock,
      price: Number(s.price),
      type: 'RAW',
    });
  });

  craftStocks.forEach((s) => {
    items.push({
      id: s.id,
      itemId: s.craftId,
      name: s.craftItem.name,
      stock: s.stock,
      price: Number(s.price),
      type: 'CRAFT',
    });
  });

  return items;
}

export async function buyItemBM(
  userId: string,
  stockPeriodId: string, // This is the ID of the StockPeriod record
  amount: number,
  type: 'RAW' | 'CRAFT'
): Promise<ActionResult<TradingData>> {
    if (amount <= 0) return { success: false, error: "Amount must be positive." };

    // 1. Get User
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found." };
    }
    const tradingData = userResult.data.tradingData;

    // 2. Fetch Stock Record & Validate
    // We need to know if it's Raw or Craft to query correct table
    let stockRecord: any; // RawStockPeriod | CraftStockPeriod
    let itemName = "";
    let itemId = "";

    if (type === 'RAW') {
        stockRecord = await prisma.rawStockPeriod.findUnique({
            where: { id: stockPeriodId },
            include: { rawItem: true }
        });
        if (stockRecord) {
            itemName = stockRecord.rawItem.name;
            itemId = stockRecord.rawId;
        }
    } else {
        stockRecord = await prisma.craftStockPeriod.findUnique({
            where: { id: stockPeriodId },
            include: { craftItem: true }
        });
        if(stockRecord) {
            itemName = stockRecord.craftItem.name;
            itemId = stockRecord.craftId;
        }
    }

    if (!stockRecord) {
        return { success: false, error: "Item no longer available." };
    }

    if (stockRecord.stock < amount) {
        return { success: false, error: `Insufficient stock for ${itemName}.` };
    }

    // 3. Calculate Price (BigInt safe)
    // Price is BigInt in DB. Amount is number.
    const pricePerUnit = BigInt(stockRecord.price);
    const totalPriceBigInt = pricePerUnit * BigInt(amount);
    
    // Convert User Balance (Int) to BigInt for comparison or cast Total to Int
    // Eternites is Int.
    // If totalPrice exceeds Int range, it's definitely unaffordable since balance is Int.
    // Max Safe Integer is 9e15. Int (32) is 2e9.
    // So converting BigInt price to Number is SAFE FOR COMPARISON with Int balance.
    const totalPriceNumber = Number(totalPriceBigInt);

    if (tradingData.eternites < totalPriceNumber) {
        return { 
            success: false, 
            error: `Insufficient Eternites. Cost: ${totalPriceNumber.toLocaleString("en-US")}, Balance: ${tradingData.eternites.toLocaleString("en-US")}` 
        };
    }

    // 4. Transaction
    try {
        // Prepare Operations
        const ops: any[] = [];
        
        // Deduct Stock
        if (type === 'RAW') {
             ops.push(prisma.rawStockPeriod.update({
                where: { id: stockPeriodId },
                data: { stock: { decrement: amount } }
            }));
        } else {
             ops.push(prisma.craftStockPeriod.update({
                where: { id: stockPeriodId },
                data: { stock: { decrement: amount } }
            }));
        }

        // Deduct User Balance & Log
        ops.push(
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { eternites: { decrement: totalPriceNumber } }
            }),
            prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(-Math.floor(totalPriceNumber)),
                    type: BalanceLogType.DEBIT,
                    resource: BalanceTradingResource.ETERNITES,
                    message: `Bought ${amount} ${itemName} (BM)`
                }
            })
        );

        // Add Item to Inventory
        if (type === 'RAW') {
            const existing = tradingData.rawUserAmounts.find(u => u.rawItemId === itemId);
            if (existing) {
                ops.push(prisma.rawUserAmount.update({
                    where: { id: existing.id },
                    data: { amount: { increment: amount } }
                }));
            } else {
                ops.push(prisma.rawUserAmount.create({
                    data: { tradingDataId: tradingData.id, rawItemId: itemId, amount: amount }
                }));
            }
        } else {
            const existing = tradingData.craftUserAmounts.find(u => u.craftItemId === itemId);
            if (existing) {
                ops.push(prisma.craftUserAmount.update({
                    where: { id: existing.id },
                    data: { amount: { increment: amount } }
                }));
            } else {
                ops.push(prisma.craftUserAmount.create({
                    data: { tradingDataId: tradingData.id, craftItemId: itemId, amount: amount }
                }));
            }
        }

        // Execute
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

        return { success: true, data: finalData!, message: `Successfully bought ${amount} ${itemName}` };

    } catch (error) {
        console.error("Black Market Buy Error:", error);
        return { success: false, error: "Transaction failed. Stock may have changed." };
    }
}