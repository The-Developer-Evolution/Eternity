import prisma from "@/lib/prisma";

export async function upgradeAccessCard(userId: string) {
  // 1. Get User's Rally Data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { rallyData: true },
  });

  if (!user || !user.rallyData) {
    throw new Error("User rally data not found");
  }

  const { rallyData } = user;
  const nextCostId = rallyData.level_upgrade_cost_id;

  // 2. Get Upgrade Cost
  const upgradeCost = await prisma.access_card_upgrade_cost.findUnique({
    where: { id: nextCostId },
  });

  if (!upgradeCost) {
    throw new Error("Max level reached or upgrade cost not found");
  }

  // 3. Verify Resources
  // 3a. Check Eonix
  if (rallyData.enonix < upgradeCost.eonix_cost) {
    throw new Error(`Not enough Eonix. Required: ${upgradeCost.eonix_cost}, Available: ${rallyData.enonix}`);
  }

  // 3b. Check Big Item
  if (upgradeCost.big_item_id && upgradeCost.big_item_amount_required > 0) {
    const userBigItem = await prisma.userBigItemInventory.findFirst({
      where: {
        user_id: userId,
        big_item_id: upgradeCost.big_item_id,
      },
    });

    const currentAmount = userBigItem?.amount || 0;
    if (currentAmount < upgradeCost.big_item_amount_required) {
      throw new Error("Not enough Big Items required for upgrade");
    }
  }

  // 3c. Check Small Item
  if (upgradeCost.small_item_id && upgradeCost.small_item_amount_required > 0) {
    const userSmallItem = await prisma.userSmallItemInventory.findFirst({
      where: {
        user_id: userId,
        small_item_id: upgradeCost.small_item_id,
      },
    });

    const currentAmount = userSmallItem?.amount || 0;
    if (currentAmount < upgradeCost.small_item_amount_required) {
      throw new Error("Not enough Small Items required for upgrade");
    }
  }

  // 4. Perform Upgrade Transaction
  return await prisma.$transaction(async (tx) => {
    // Deduct Eonix and Update Level
    const updatedRallyData = await tx.rallyData.update({
      where: { user_id: userId },
      data: {
        enonix: { decrement: upgradeCost.eonix_cost },
        access_card_level: { increment: 1 },
        level_upgrade_cost_id: { increment: 1 },
      },
    });

    // Deduct Big Item
    if (upgradeCost.big_item_id && upgradeCost.big_item_amount_required > 0) {
      // We already checked existence above, but to be safe and atomic:
      // We find first again or assume it exists because of check? 
      // best to findFirst inside transaction or updateMany with count check?
      // updateMany is safer if we don't have the ID handy, but we need to ensure it didn't disappear.
      // Since it's a game, standard finding is usually fine.
      const itemInventory = await tx.userBigItemInventory.findFirst({
        where: { user_id: userId, big_item_id: upgradeCost.big_item_id }
      });
      
      if(itemInventory) {
          await tx.userBigItemInventory.update({
            where: { id: itemInventory.id },
            data: { amount: { decrement: upgradeCost.big_item_amount_required } },
          });
      }
    }

    // Deduct Small Item
    if (upgradeCost.small_item_id && upgradeCost.small_item_amount_required > 0) {
         const itemInventory = await tx.userSmallItemInventory.findFirst({
            where: { user_id: userId, small_item_id: upgradeCost.small_item_id }
          });
          
          if(itemInventory) {
              await tx.userSmallItemInventory.update({
                where: { id: itemInventory.id },
                data: { amount: { decrement: upgradeCost.small_item_amount_required } },
              });
          }
    }
    await prisma.rallyActivityLog.create({
        data: {
            user_id: userId,
            message: `Upgraded Access Card to level ${updatedRallyData.access_card_level}, costing Eonix: ${upgradeCost.eonix_cost}`,
        }
    });
    return updatedRallyData;
  });
}
