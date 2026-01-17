'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import { BalanceLogType, BalanceTradingResource } from "@prisma/client";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getRunningTradingPeriod } from "../action";

export type CraftRecipeDetail = {
  id: string; // CraftItem ID
  name: string;
  recipes: {
    rawItemName: string;
    amount: number;
  }[];
};

export async function getAllCraftRecipes(): Promise<CraftRecipeDetail[]> {
  const craftItems = await prisma.craftItem.findMany({
    include: {
      craftRecipes: {
        include: {
          rawItem: true,
        },
      },
    },
  });

  return craftItems.map((item) => ({
    id: item.id,
    name: item.name,
    recipes: item.craftRecipes.map((r) => ({
      rawItemName: r.rawItem.name,
      amount: r.amount,
    })),
  }));
}

export async function itemToCraft(
  userId: string,
  craftItemId: string
): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

  // 1. Get user trading data including inventory
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found" };
  }
  const tradingData = userResult.data.tradingData;

  // 2. Get Recipe from DB
  const craftItem = await prisma.craftItem.findUnique({
    where: { id: craftItemId },
    include: {
        craftRecipes: {
            include: { rawItem: true }
        }
    }
  });

  if (!craftItem) {
      return { success: false, error: "Craft item not found" };
  }
  
  if (craftItem.craftRecipes.length === 0) {
      return { success: false, error: "No recipe defined for this item" };
  }

  // 3. Validation: Check inventory
  const transactionOps = [];
  let totalRawConsumed = 0;

  for (const recipe of craftItem.craftRecipes) {
      const userRawAmount = tradingData.rawUserAmounts.find(
          (ura) => ura.rawItemId === recipe.rawItemId
      );

      if (!userRawAmount || userRawAmount.amount < recipe.amount) {
          return { 
              success: false, 
              error: `Insufficient ${recipe.rawItem.name}. Required: ${recipe.amount}, Available: ${userRawAmount?.amount || 0}` 
          };
      }

      // Add to transaction ops: Decrement RawUserAmount
      transactionOps.push(
          prisma.rawUserAmount.update({
              where: { id: userRawAmount.id },
              data: { amount: { decrement: recipe.amount } }
          })
      );
      totalRawConsumed += recipe.amount;
  }

  // 4. Update/Create CraftUserAmount
  const existingCraftAmount = tradingData.craftUserAmounts.find(
      (cua) => cua.craftItemId === craftItemId
  );

  if (existingCraftAmount) {
      transactionOps.push(
          prisma.craftUserAmount.update({
              where: { id: existingCraftAmount.id },
              data: { amount: { increment: 1 } }
          })
      );
  } else {
      transactionOps.push(
          prisma.craftUserAmount.create({
              data: {
                  tradingDataId: tradingData.id,
                  craftItemId: craftItemId,
                  amount: 1
              }
          })
      );
  }

  // 5. Add Logs
  transactionOps.push(
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(totalRawConsumed),
              type: BalanceLogType.DEBIT,
              resource: BalanceTradingResource.RAW,
              message: `Consumed materials to craft ${craftItem.name}`,
          },
      })
  );

  transactionOps.push(
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(1),
              type: BalanceLogType.CREDIT,
              resource: BalanceTradingResource.CRAFT,
              message: `Crafted ${craftItem.name}`,
          },
      })
  );

  // 6. Execute Transaction
  try {
      await prisma.$transaction(transactionOps);

      // Return updated data
      const finalData = await prisma.tradingData.findUnique({
          where: { id: tradingData.id },
          include: {
              rawUserAmounts: { include: { rawItem: true } },
              craftUserAmounts: { include: { craftItem: true } },
              balanceTradingLogs: true,
          },
      });

      return {
          success: true,
          data: finalData!,
          message: `Successfully crafted ${craftItem.name}`,
      };

  } catch (error) {
      console.error("Crafting error:", error);
      return { success: false, error: "Failed to execute crafting transaction" };
  }
}

// Bulk Crafting with Custom Cost
export async function craftBulkItems(
  userId: string,
  items: { id: string, amount: number }[],
  customCost: number = 500
): Promise<ActionResult<TradingData>> {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (customCost < 0) return { success: false, error: "Cost cannot be negative" };
    if (items.length === 0) return { success: false, error: "No items selected to craft" };

    // 1. Get User Data
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found" };
    }
    const tradingData = userResult.data.tradingData;

    try {
        return await prisma.$transaction(async (tx) => {
            // Track consumption locally to validate availability across multiple items
            // Map<RawItemId, AmountAvailable>
            const rawInventory = new Map<string, number>();
            tradingData.rawUserAmounts.forEach(ura => rawInventory.set(ura.rawItemId, Number(ura.amount)));

            const totalEternitesRequired = customCost;
            const logMessages: string[] = [];

            // 2. Process Items
            for (const item of items) {
                if (item.amount <= 0) continue;

                const craftItem = await tx.craftItem.findUnique({
                    where: { id: item.id },
                    include: { craftRecipes: { include: { rawItem: true } } }
                });

                if (!craftItem) throw new Error(`Craft item ${item.id} not found`);
                if (craftItem.craftRecipes.length === 0) throw new Error(`No recipe for ${craftItem.name}`);

                // Check & Consume Raw Materials
                for (const recipe of craftItem.craftRecipes) {
                    const requiredAmount = recipe.amount * item.amount;
                    const available = rawInventory.get(recipe.rawItemId) || 0;

                    if (available < requiredAmount) {
                         throw new Error(`Insufficient ${recipe.rawItem.name} for ${item.amount}x ${craftItem.name}. Required: ${requiredAmount}, Available: ${available}`);
                    }

                    // Deduct local simulation
                    rawInventory.set(recipe.rawItemId, available - requiredAmount);

                    // Add DB Op: Decrement Raw
                    const ura = tradingData.rawUserAmounts.find(u => u.rawItemId === recipe.rawItemId);
                    if (ura) { // Should exist if available > 0
                        await tx.rawUserAmount.update({
                            where: { id: ura.id },
                            data: { amount: { decrement: requiredAmount } }
                        });
                    }
                    
                    // Log specific consumption? Or generic? 
                    // Existing uses generic RAW debit.
                    // Let's create a consumption log per crafting operation (or grouped).
                    // To avoid spamming logs, maybe we group by raw item?
                    // For now, let's allow "Consumed materials..." per craft item type or just one big log.
                    // The existing system logs per item type crafted. Let's stick to that.
                }

                // Grant Craft Item
                const existingCraftAmount = await tx.craftUserAmount.findFirst({
                    where: { tradingDataId: tradingData.id, craftItemId: item.id }
                });
                
                if (existingCraftAmount) {
                    await tx.craftUserAmount.update({
                        where: { id: existingCraftAmount.id },
                        data: { amount: { increment: item.amount } }
                    });
                } else {
                    await tx.craftUserAmount.create({
                        data: {
                            tradingDataId: tradingData.id,
                            craftItemId: item.id,
                            amount: item.amount
                        }
                    });
                }

                logMessages.push(`${item.amount}x ${craftItem.name}`);
            }

            // 3. User Balance Check (Cost)
            if (tradingData.eternites < totalEternitesRequired) {
                 throw new Error(`Insufficient Eternites. Required: ${totalEternitesRequired}, Available: ${tradingData.eternites}`);
            }

            // Deduct Cost
            if (totalEternitesRequired > 0) {
                await tx.tradingData.update({
                    where: { id: tradingData.id },
                    data: { eternites: { decrement: totalEternitesRequired } }
                });

                // Log Cost
                await tx.balanceTradingLog.create({
                    data: {
                        tradingDataId: tradingData.id,
                        amount: BigInt(totalEternitesRequired),
                        type: BalanceLogType.DEBIT,
                        resource: BalanceTradingResource.ETERNITES,
                        message: `Crafting Transaction Fee`,
                    }
                });
            }

            // 4. Log Crafted Items
             await tx.balanceTradingLog.create({
                data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(items.reduce((acc, i) => acc + i.amount, 0)),
                    type: BalanceLogType.CREDIT,
                    resource: BalanceTradingResource.CRAFT,
                    message: `Bulk Crafted: ${logMessages.join(", ")}`,
                }
            });
            
            await tx.balanceTradingLog.create({
                 data: {
                    tradingDataId: tradingData.id,
                    amount: BigInt(0), 
                    type: BalanceLogType.DEBIT,
                    resource: BalanceTradingResource.RAW,
                    message: `Consumed raw materials for crafting`,
                }
            });

            // Return updated data
            const finalData = await tx.tradingData.findUnique({
               where: { id: tradingData.id },
                include: {
                    rawUserAmounts: { include: { rawItem: true } },
                    craftUserAmounts: { include: { craftItem: true } },
                    balanceTradingLogs: true,
                }, 
            });

            return {
                success: true,
                data: finalData!,
                message: `Successfully crafted: ${logMessages.join(", ")}`,
            };

        });
    } catch (e) {
        console.error("Bulk Craft Error", e);
        return { success: false, error: e instanceof Error ? e.message : "Crafting failed" };
    }
}
