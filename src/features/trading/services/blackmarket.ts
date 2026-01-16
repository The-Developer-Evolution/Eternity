'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@prisma/client";
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
  const blackmarketFee = BigInt(1000);
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
    let rawStockRecord = null;
    let craftStockRecord = null;
    let itemName = "";
    let itemId = "";

    if (type === 'RAW') {
        rawStockRecord = await prisma.rawStockPeriod.findUnique({
            where: { id: stockPeriodId },
            include: { rawItem: true }
        });
        if (rawStockRecord) {
            itemName = rawStockRecord.rawItem.name;
            itemId = rawStockRecord.rawId;
        }
    } else {
        craftStockRecord = await prisma.craftStockPeriod.findUnique({
            where: { id: stockPeriodId },
            include: { craftItem: true }
        });
        if(craftStockRecord) {
            itemName = craftStockRecord.craftItem.name;
            itemId = craftStockRecord.craftId;
        }
    }

    if (!rawStockRecord && !craftStockRecord) {
        return { success: false, error: "Item no longer available." };
    }

    const currentStock = rawStockRecord ? rawStockRecord.stock : craftStockRecord!.stock;
    const currentPrice = rawStockRecord ? rawStockRecord.price : craftStockRecord!.price;

    if (currentStock < amount) {
        return { success: false, error: `Insufficient stock for ${itemName}.` };
    }

    // 3. Calculate Price (BigInt safe)
    // Price is BigInt in DB. Amount is number.
    const pricePerUnit = BigInt(currentPrice);
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
        const ops = [];
        
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

export async function buyBulkItemsBM(
  userId: string,
  items: { stockPeriodId: string; amount: number; type: 'RAW' | 'CRAFT'; }[]
): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (!items || items.length === 0) return { success: false, error: "No items selected." };
    if (items.some(i => i.amount <= 0)) return { success: false, error: "Invalid amount." };

    // 1. Get User
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found." };
    }
    const tradingData = userResult.data.tradingData;

    try {
        let totalCost = BigInt(0);
        const operations = [];

        for (const item of items) {
             let rawStockRecord = null;
             let craftStockRecord = null;
             let itemName = "";
             let itemId = "";

             if (item.type === 'RAW') {
                rawStockRecord = await prisma.rawStockPeriod.findUnique({
                    where: { id: item.stockPeriodId },
                    include: { rawItem: true }
                });
                 if (rawStockRecord) {
                    itemName = rawStockRecord.rawItem.name;
                    itemId = rawStockRecord.rawId;
                }
             } else {
                craftStockRecord = await prisma.craftStockPeriod.findUnique({
                    where: { id: item.stockPeriodId },
                    include: { craftItem: true }
                });
                if(craftStockRecord) {
                    itemName = craftStockRecord.craftItem.name;
                    itemId = craftStockRecord.craftId;
                }
             }
             
             if (!rawStockRecord && !craftStockRecord) throw new Error(`Item ${item.stockPeriodId} no longer available.`);
             
             const currentStock = rawStockRecord ? rawStockRecord.stock : craftStockRecord!.stock;
             const currentPrice = rawStockRecord ? rawStockRecord.price : craftStockRecord!.price;

             if (currentStock < item.amount) throw new Error(`Insufficient stock for ${itemName}.`);

             const cost = BigInt(currentPrice) * BigInt(item.amount);
             totalCost += cost;

             // Prepare Deduction Operation
             if (item.type === 'RAW') {
                 operations.push(prisma.rawStockPeriod.update({
                    where: { id: item.stockPeriodId },
                    data: { stock: { decrement: item.amount } }
                 }));
             } else {
                 operations.push(prisma.craftStockPeriod.update({
                    where: { id: item.stockPeriodId },
                    data: { stock: { decrement: item.amount } }
                 }));
             }
             
             if (item.type === 'RAW') {
                const existing = tradingData.rawUserAmounts.find(u => u.rawItemId === itemId);
                if (existing) {
                    operations.push(prisma.rawUserAmount.update({
                        where: { id: existing.id },
                        data: { amount: { increment: item.amount } }
                    }));
                } else {
                    operations.push(prisma.rawUserAmount.create({
                        data: { tradingDataId: tradingData.id, rawItemId: itemId, amount: item.amount }
                    }));
                }
             } else {
                 const existing = tradingData.craftUserAmounts.find(u => u.craftItemId === itemId);
                if (existing) {
                    operations.push(prisma.craftUserAmount.update({
                        where: { id: existing.id },
                        data: { amount: { increment: item.amount } }
                    }));
                } else {
                    operations.push(prisma.craftUserAmount.create({
                        data: { tradingDataId: tradingData.id, craftItemId: itemId, amount: item.amount }
                    }));
                }
             }
        }

        const totalCostNumber = Number(totalCost);
        if (tradingData.eternites < totalCostNumber) {
            return { success: false, error: `Insufficient Eternites. Cost: ${totalCostNumber.toLocaleString()}, Balance: ${tradingData.eternites.toLocaleString()}` };
        }

        // Add Balance Deduction
        operations.push(
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { eternites: { decrement: totalCostNumber } }
            }),
             prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(-Math.floor(totalCostNumber)),
                    type: BalanceLogType.DEBIT,
                    resource: BalanceTradingResource.ETERNITES,
                    message: `Bought ${items.length} items (BM Bulk)`
                }
            })
        );

        // Execute Transaction
        await prisma.$transaction(operations);

        // Return updated data
        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: { include: { rawItem: true } },
                craftUserAmounts: { include: { craftItem: true } },
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData!, message: "Bulk Purchase Successful!" };

    } catch (error) {
        console.error("Black Market Bulk Buy Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Transaction failed." };
    }
}

export async function sellBulkItemsBM(
    userId: string,
    items: { id: string; amount: number; type: 'RAW' | 'CRAFT'; }[] // id is the ITEM ID, not Stock ID
): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (!items || items.length === 0) return { success: false, error: "No items selected." };
    if (items.some(i => i.amount <= 0)) return { success: false, error: "Invalid amount." };

    // 1. Get User
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found." };
    }
    const tradingData = userResult.data.tradingData;

    // 2. Fetch Active Stock Periods to get Prices
    const activePeriod = await getActiveTradingPeriod();
    if (!activePeriod) return { success: false, error: "No active trading period." };

    const [rawStocks, craftStocks] = await Promise.all([
        prisma.rawStockPeriod.findMany({ where: { periode: activePeriod.periode }, include: { rawItem: true } }),
        prisma.craftStockPeriod.findMany({ where: { periode: activePeriod.periode }, include: { craftItem: true } })
    ]);

    try {
        let totalPay = BigInt(0);
        const operations = [];
        
        for (const item of items) {
            let price = BigInt(0);
            let itemName = "";
            
            // Check Price & Validity
            if (item.type === 'RAW') {
                const stock = rawStocks.find(s => s.rawId === item.id);
                if (!stock) throw new Error(`Item ${item.id} is not currently tradable in Black Market.`);
                price = BigInt(stock.price);
                itemName = stock.rawItem.name;

                // Check User Ownership
                const userOwned = tradingData.rawUserAmounts.find(u => u.rawItemId === item.id);
                if (!userOwned || userOwned.amount < item.amount) {
                    throw new Error(`Insufficient ${itemName} in user inventory.`);
                }
                
                // Deduct from User
                operations.push(prisma.rawUserAmount.update({
                    where: { id: userOwned.id },
                    data: { amount: { decrement: item.amount } }
                }));

            } else {
                const stock = craftStocks.find(s => s.craftId === item.id);
                if (!stock) throw new Error(`Item ${item.id} is not currently tradable in Black Market.`);
                price = BigInt(stock.price);
                itemName = stock.craftItem.name;

                // Check User Ownership
                 const userOwned = tradingData.craftUserAmounts.find(u => u.craftItemId === item.id);
                if (!userOwned || userOwned.amount < item.amount) {
                     throw new Error(`Insufficient ${itemName} in user inventory.`);
                }
                
                // Deduct from User
                operations.push(prisma.craftUserAmount.update({
                     where: { id: userOwned.id },
                    data: { amount: { decrement: item.amount } }
                }));
            }

            // Calculate Pay
            totalPay += price * BigInt(item.amount);
            
            // NOTE: Selling does NOT update Stock Period stock, per requirements.
        }

        const totalPayNumber = Number(totalPay);

        // Add Money to User
        operations.push(
            prisma.tradingData.update({
                where: { id: tradingData.id },
                data: { eternites: { increment: totalPayNumber } }
            }),
             prisma.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(Math.floor(totalPayNumber)),
                    type: BalanceLogType.CREDIT,
                    resource: BalanceTradingResource.ETERNITES,
                    message: `Sold ${items.length} items (BM Bulk)`
                }
            })
        );

        // Execute Transaction
        await prisma.$transaction(operations);

        // Return updated data
        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: { include: { rawItem: true } },
                craftUserAmounts: { include: { craftItem: true } },
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData!, message: "Items sold successfully!" };

    } catch (error) {
         console.error("Black Market Bulk Sell Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Transaction failed." };
    }
}