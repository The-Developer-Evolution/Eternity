'use server'

import { getUserTradingById } from "@/features/user/trading.service";
import {  BalanceLogType, BalanceTradingResource } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actionResult";
import { TradingData } from "@/generated/prisma/client";
import { getRunningTradingPeriod } from "../action";

export async function getAllMapRecipes() {
    return await prisma.mapRecipe.findMany({
        include: {
            mapRecipeComponents: {
                include: {
                    craftItem: true
                }
            }
        }
    });
}

// create map using map recipe (recipe dari database)
export async function craftToMap(
  userId: string,
  mapRecipeId: string,
  amount: number = 1,
  cost: number = 0
): Promise<ActionResult<TradingData>> {

    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

  if (amount <= 0) return { success: false, error: "Amount must be positive" };
  if (cost < 0) return { success: false, error: "Cost cannot be negative" };

  // 1. Get user trading data
  const userResult = await getUserTradingById(userId);
  if (!userResult.success || !userResult.data?.tradingData) {
    return { success: false, error: "User not found" };
  }

  const tradingData = userResult.data.tradingData;

  // 1.5 Check Balance (Eternites) for the cost
  if (tradingData.eternites < cost) {
       return { success: false, error: `Insufficient Eternites. Required: ${cost}, Available: ${tradingData.eternites}` };
  }

  // 2. Get Recipe
  const recipe = await prisma.mapRecipe.findUnique({
      where: { id: mapRecipeId },
      include: {
          mapRecipeComponents: {
              include: { craftItem: true }
          }
      }
  });

  if (!recipe) {
      return { success: false, error: "Recipe not found." };
  }

  // 3. Check Inventory & Prepare Transaction
  const ops: any[] = [];
  let totalItemsConsumed = 0;

  for (const component of recipe.mapRecipeComponents) {
      const requiredAmount = BigInt(component.amount) * BigInt(amount);
      const userItem = tradingData.craftUserAmounts.find(u => u.craftItemId === component.craftItemId);

      if (!userItem || userItem.amount < requiredAmount) {
          return {
              success: false,
              error: `Insufficient ${component.craftItem.name}. Required: ${requiredAmount}, Available: ${userItem?.amount || 0}`
          };
      }

      // Add decrement op
      ops.push(prisma.craftUserAmount.update({
          where: { id: userItem.id },
          data: { amount: { decrement: requiredAmount } }
      }));
      
      totalItemsConsumed += Number(requiredAmount); // Approx for log
  }

  // 4. Add Map & Log & Deduct Cost
  // Deduct Cost (Eternites)
  if (cost > 0) {
      ops.push(prisma.tradingData.update({
          where: { id: tradingData.id },
          data: { eternites: { decrement: cost } }
      }));
      
      ops.push(prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(-cost),
              type: BalanceLogType.DEBIT,
              resource: BalanceTradingResource.ETERNITES,
              message: `Paid cost for Map Recipe`
          }
      }));
  }

  ops.push(
      prisma.tradingData.update({
          where: { id: tradingData.id },
          data: { map: { increment: amount } }
      }),
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(-totalItemsConsumed), // Just a simplistic log, better to log credited Map separately? Existing logic logged debit & credit.
              type: BalanceLogType.DEBIT,
              resource: BalanceTradingResource.CRAFT,
              message: `Consumed items for ${amount} Map(s)`
          }
      }),
      prisma.balanceTradingLog.create({
          data: {
              tradingDataId: tradingData.id,
              amount: BigInt(amount),
              type: BalanceLogType.CREDIT,
              resource: BalanceTradingResource.MAP,
              message: `Crafted ${amount} Map(s)`
          }
      })
  );

  try {
      await prisma.$transaction(ops);

      const finalData = await prisma.tradingData.findUnique({
          where: { id: tradingData.id },
          include: {
              rawUserAmounts: { include: { rawItem: true } },
              craftUserAmounts: { include: { craftItem: true } },
              balanceTradingLogs: true,
          },
      });

      return { success: true, data: finalData!, message: `Successfully crafted ${amount} Map(s)` };

  } catch (error) {
      console.error("Craft Map Error", error);
      return { success: false, error: "Transaction failed" };
  }
}


// create map using CUSTOM RECIPE (recipe bukan dari database)
export async function craftMapWithCustomRecipe(
  userId: string,
  components: [string, number][], // [craftId, amount]
  cost: number,
  amount: number
): Promise<ActionResult<TradingData>> {

    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (amount <= 0) return { success: false, error: "Amount must be positive" };
    if (cost < 0) return { success: false, error: "Cost cannot be negative" };

    // 1. Get user trading data
    const userResult = await getUserTradingById(userId);
    if (!userResult.success || !userResult.data?.tradingData) {
        return { success: false, error: "User not found" };
    }

    const tradingData = userResult.data.tradingData;

    // 2. Check Balance (Eternites) for the one-time cost
    if (tradingData.eternites < cost) {
         return { success: false, error: `Insufficient Eternites. Required: ${cost}, Available: ${tradingData.eternites}` };
    }

    // 3. Validate Components & Check Inventory
    const ops: any[] = [];
    let totalItemsConsumed = 0; // For logging purpose
    
    
    for (const [craftId, quantityPerMap] of components) {
        if (quantityPerMap <= 0) continue; 

        // Total required for this component
        const totalRequired = BigInt(quantityPerMap) * BigInt(amount);

        const userItem = tradingData.craftUserAmounts.find(u => u.craftItemId === craftId);

        if (!userItem || userItem.amount < totalRequired) {
            return {
                success: false,
                error: `Insufficient material (ID: ${craftId}). Required: ${totalRequired}, Available: ${userItem?.amount || 0}`
            };
        }

        // Add decrement op
        ops.push(prisma.craftUserAmount.update({
            where: { id: userItem.id },
            data: { amount: { decrement: totalRequired } }
        }));
        
        totalItemsConsumed += Number(totalRequired);
    }

    // 4. Prepare Transaction
    
    // Deduct Cost (Eternites)
    if (cost > 0) {
        ops.push(prisma.tradingData.update({
            where: { id: tradingData.id },
            data: { eternites: { decrement: cost } }
        }));
        
        ops.push(prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(-cost),
                type: BalanceLogType.DEBIT,
                resource: BalanceTradingResource.ETERNITES,
                message: `Paid cost for custom map crafting`
            }
        }));
    }

    // Add Map increment
    ops.push(prisma.tradingData.update({
        where: { id: tradingData.id },
        data: { map: { increment: amount } }
    }));

    // Log Component Consumption
    if (totalItemsConsumed > 0) {
        ops.push(prisma.balanceTradingLog.create({
            data: {
                tradingDataId: tradingData.id,
                amount: BigInt(-totalItemsConsumed),
                type: BalanceLogType.DEBIT,
                resource: BalanceTradingResource.CRAFT,
                message: `Consumed items for ${amount} Custom Map(s)`
            }
        }));
    }

    // Log Map Production
     ops.push(prisma.balanceTradingLog.create({
        data: {
            tradingDataId: tradingData.id,
            amount: BigInt(amount),
            type: BalanceLogType.CREDIT,
            resource: BalanceTradingResource.MAP,
            message: `Crafted ${amount} Map(s) (Custom)`
        }
    }));


    try {
        await prisma.$transaction(ops);

        const finalData = await prisma.tradingData.findUnique({
            where: { id: tradingData.id },
            include: {
                rawUserAmounts: { include: { rawItem: true } },
                craftUserAmounts: { include: { craftItem: true } },
                balanceTradingLogs: true,
            },
        });

        return { success: true, data: finalData!, message: `Successfully crafted ${amount} Map(s)` };

    } catch (error) {
        console.error("Custom Craft Map Error", error);
        return { success: false, error: "Transaction failed" };
    }
}

