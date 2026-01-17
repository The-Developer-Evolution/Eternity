'use server'

import { BalanceLogType, BalanceTradingResource, TradingData } from "@prisma/client";
import { ActionResult } from "@/types/actionResult";
import { getUserTradingById } from "@/features/user/trading.service";
import prisma from "@/lib/prisma";
import { getRunningTradingPeriod } from "../action";


// Beli Raw Material
export async function buyMaterial(
  userId: string,
  rawItemId: string,
  amount: number
): Promise<ActionResult<TradingData>> {
  const period = await getRunningTradingPeriod()
  if (!period) return { success: false, error: "The game is PAUSED" };

  if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
  }

  console.log("BUY MATERIAL search for : ", userId);
  const buyer = await getUserTradingById(userId);
  if (!buyer.success || !buyer.data?.tradingData) {
    return { success: false, error: "User or trading data not found" };
  }

  const tradingData = buyer.data.tradingData;

  // 1. Check raw item exists (seeded)
  const rawItem = await prisma.rawItem.findUnique({
    where: { id: rawItemId },
  });

  if (!rawItem) {
    return { success: false, error: `Raw material not found` };
  }

  const rawPeriod = await prisma.rawPeriod.findFirst({
      where: {
          rawId: rawItemId,
          periode: period.periode
      }
  });

  if (!rawPeriod) {
      return { success: false, error: `Price for ${rawItem.name} not found in current period` };
  }

  const materialName = rawItem.name;
  const priceFn = Number(rawPeriod.price);
  const totalPrice = priceFn * amount;

  // 2. Check balance
  if (tradingData.eternites < totalPrice) {
    return { success: false, error: "Insufficient balance" };
  }

  // 3. Atomic transaction with Interactive Transaction
  return await prisma.$transaction(async (tx) => {
    // A. Decrement balance
    const updatedUser = await tx.tradingData.update({
      where: { userId },
      data: {
        eternites: {
          decrement: totalPrice,
        },
      },
    });

    // B. Find existing UserRawAmount
    const existingAmount = await tx.rawUserAmount.findFirst({
      where: {
        tradingDataId: tradingData.id,
        rawItemId: rawItem.id,
      },
    });

    if (existingAmount) {
      await tx.rawUserAmount.update({
        where: { id: existingAmount.id },
        data: {
          amount: { increment: amount },
        },
      });
    } else {
      await tx.rawUserAmount.create({
        data: {
          tradingDataId: tradingData.id,
          rawItemId: rawItem.id,
          amount: amount,
        },
      });
    }

    // C. Logs
    await tx.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(totalPrice),
        message: `Spent ${totalPrice} eternites to buy ${amount}x ${materialName}`,
        type: BalanceLogType.DEBIT,
        resource: BalanceTradingResource.ETERNITES,
      },
    });

     await tx.balanceTradingLog.create({
      data: {
        tradingDataId: tradingData.id,
        amount: BigInt(amount),
        message: `Acquired ${amount}x raw material: ${materialName}`,
        type: BalanceLogType.CREDIT,
        resource: BalanceTradingResource.RAW,
      },
    });

    return {
      success: true,
      data: updatedUser,
      message: `Successfully bought ${amount}x ${materialName}`,
    };
  });
}

// Custom Raw Material Purchase (Multi-select + Transaction Fee)
export async function buyCustomRawMaterials(
  userId: string,
  items: { id: string, amount: number }[],
  transactionFee: number = 0
): Promise<ActionResult<TradingData>> {

    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (transactionFee < 0) return { success: false, error: "Transaction fee cannot be negative" };
    if (items.length === 0) return { success: false, error: "No items selected" };

    // 1. Get user
    const buyer = await getUserTradingById(userId);
    if (!buyer.success || !buyer.data?.tradingData) {
        return { success: false, error: "User or trading data not found" };
    }
    const tradingData = buyer.data.tradingData;

    try {
        return await prisma.$transaction(async (tx) => {
            let totalItemCost = 0;
            const logMessages: string[] = [];

            // 2. Process Items & Calculate Cost
            for (const item of items) {
                if (item.amount <= 0) continue;

                const rawItem = await tx.rawItem.findUnique({ where: { id: item.id } });
                if (!rawItem) throw new Error(`Item ${item.id} not found`);

                const rawPeriod = await tx.rawPeriod.findFirst({
                    where: {
                        rawId: item.id,
                        periode: period.periode
                    }
                });

                if (!rawPeriod) throw new Error(`Price for item ${rawItem.name} not found in current period`);

                const cost = Number(rawPeriod.price) * item.amount;
                totalItemCost += cost;

                // Grant Item
                const existingAmount = await tx.rawUserAmount.findFirst({
                    where: { tradingDataId: tradingData.id, rawItemId: item.id }
                });

                if (existingAmount) {
                    await tx.rawUserAmount.update({
                        where: { id: existingAmount.id },
                        data: { amount: { increment: item.amount } }
                    });
                } else {
                    await tx.rawUserAmount.create({
                        data: {
                            tradingDataId: tradingData.id,
                            rawItemId: item.id,
                            amount: item.amount
                        }
                    });
                }
                
                logMessages.push(`${item.amount}x ${rawItem.name}`);
            }

            const totalDeduction = totalItemCost + transactionFee;

            // 3. Check Balance & Deduct
            if (tradingData.eternites < totalDeduction) {
                // Determine what failed? 
                if (tradingData.eternites < transactionFee) throw new Error(`Insufficient funds for transaction fee (${transactionFee} E)`);
                throw new Error(`Insufficient funds. Total Required: ${totalDeduction} E (Items: ${totalItemCost} + Fee: ${transactionFee}), Available: ${tradingData.eternites} E`);
            }

            // Deduct Total
            const updatedUser = await tx.tradingData.update({
                where: { id: tradingData.id },
                data: { eternites: { decrement: totalDeduction } }
            });

            // 4. Logs 
            
            // Log Debit
            await tx.balanceTradingLog.create({
                 data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(totalDeduction),
                    message: `Bulk Purchase: ${logMessages.join(", ")}. (Items Cost: ${totalItemCost} + Fee: ${transactionFee})`,
                    type: BalanceLogType.DEBIT,
                    resource: BalanceTradingResource.ETERNITES,
                }
            });

             
            const totalQuantity = items.reduce((acc, curr) => acc + curr.amount, 0);
            
            await tx.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(totalQuantity),
                    message: `Acquired: ${logMessages.join(", ")}`,
                    type: BalanceLogType.CREDIT,
                    resource: BalanceTradingResource.RAW,
                }
            });

            return {
                success: true,
                data: updatedUser,
                message: `Successfully bought raw materials. Total cost: ${totalDeduction} Eternites.`
            };

        });

    } catch (e) {
        console.error("Buy Custom Error", e);
        return { success: false, error: e instanceof Error ? e.message : "Transaction failed" };
    }
}
