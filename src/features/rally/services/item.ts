import prisma from "@/lib/prisma";

export async function getMyInventory(userId: string) {
  const big_items = await prisma.userBigItemInventory.findMany({
    where: {
      user_id: userId,
    },
    include: {
      bigItem: true,
    },
  });

  const small_items = await prisma.userSmallItemInventory.findMany({
    where: {
      user_id: userId,
    },
    include: {
      smallItem: true,
    },
  });

  return {
    big_items,
    small_items,
  };
}

export async function getTheVaultRequirements(user_id: string) {
  const userHasEterniaSigil = await prisma.userBigItemInventory.findFirst({
    where: {
      user_id: user_id,
      big_item_id: "1",
    },
  });

  const userHasChronoKey = await prisma.userBigItemInventory.findFirst({
    where: {
      user_id: user_id,
      big_item_id: "2",
    },
  });

  const userHasCoreFragment = await prisma.userBigItemInventory.findFirst({
    where: {
      user_id: user_id,
      big_item_id: "3",
    },
  });

  return {
    userHasEterniaSigil,
    userHasChronoKey,
    userHasCoreFragment,
  };
}

export async function craftTheVault(user_id: string) {
  const { userHasEterniaSigil, userHasChronoKey, userHasCoreFragment } =
    await getTheVaultRequirements(user_id);

  const missingMaterials = [];
  if (!userHasEterniaSigil || userHasEterniaSigil.amount < 1)
    missingMaterials.push("Eternia Sigil");
  if (!userHasChronoKey || userHasChronoKey.amount < 1)
    missingMaterials.push("Chrono Key");
  if (!userHasCoreFragment || userHasCoreFragment.amount < 1)
    missingMaterials.push("Core Fragment");

  if (missingMaterials.length > 0) {
    throw new Error(
      `You need ${missingMaterials.join(", ")} to craft The Vault`
    );
  }

  if (!userHasEterniaSigil || !userHasChronoKey || !userHasCoreFragment) {
    throw new Error("Material data is missing");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.userBigItemInventory.update({
      where: { id: userHasEterniaSigil.id },
      data: { amount: { decrement: 1 } },
    });

    await tx.userBigItemInventory.update({
      where: { id: userHasChronoKey.id },
      data: { amount: { decrement: 1 } },
    });

    await tx.userBigItemInventory.update({
      where: { id: userHasCoreFragment.id },
      data: { amount: { decrement: 1 } },
    });

    const updatedRallyData = await tx.rallyData.update({
      where: { user_id: user_id },
      data: { vault: { increment: 1 } },
    });

    await tx.rallyActivityLog.create({
      data: {
        user_id: user_id,
        message: `CRAFTED The Vault \n -1 Eternia Sigil\n -1 Chrono Key\n -1 Core Fragment`,
      },
    });

    return updatedRallyData;
  });

  if (!result) {
    throw new Error("Rally data not found for user");
  }

  return result;
}

export async function getAllBigItems() {
  const big_items = await prisma.rallyBigItemRecipe.findMany({
    include: {
      resultItem: true,
      smallItem: true,
    },
  });
  return big_items;
}

export async function craftBigItem(userId: string, recipeId: string) {
  const recipe = await prisma.rallyBigItemRecipe.findUnique({
    where: {
      id: recipeId,
    },
    include: {
      resultItem: true,
      smallItem: true, // Pastikan ini ada
    },
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const userSmallItem = await prisma.userSmallItemInventory.findFirst({
    where: {
      user_id: userId,
      small_item_id: recipe.small_item_id,
    },
  });

  if (!userSmallItem || userSmallItem.amount < recipe.quantity) {
    throw new Error("Not enough materials");
  }

  await prisma.userSmallItemInventory.update({
    where: {
      id: userSmallItem.id,
    },
    data: {
      amount: {
        decrement: recipe.quantity,
      },
    },
  });

  const userBigItem = await prisma.userBigItemInventory.findFirst({
    where: {
      user_id: userId,
      big_item_id: recipe.result_item_id,
    },
  });

  if (userBigItem) {
    await prisma.userBigItemInventory.update({
      where: {
        id: userBigItem.id,
      },
      data: {
        amount: {
          increment: 1,
        },
      },
    });
  } else {
    await prisma.userBigItemInventory.create({
      data: {
        user_id: userId,
        big_item_id: recipe.result_item_id,
        amount: 1,
      },
    });
  }
  
  await prisma.rallyActivityLog.create({
    data: {
      user_id: userId,
      message: `CRAFTED ${recipe.resultItem.name}\n-${recipe.quantity}x ${recipe.smallItem.name}`,
    },
  });
  return true;
}

export async function gachaItem(userId: string) {
  const smallItems = await prisma.rallySmallItem.findMany();

  if (smallItems.length === 0) {
    throw new Error("No small items available for gacha");
  }

  const rallyData = await prisma.rallyData.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!rallyData || rallyData.enonix < 3) {
    throw new Error("Not enough enonix for gacha");
  }

  await prisma.rallyData.update({
    where: {
      user_id: userId,
    },
    data: {
      enonix: {
        decrement: 3,
      },
    },
  });

  const randomIndex = Math.floor(Math.random() * smallItems.length);
  const selectedItem = smallItems[randomIndex];

  const userSmallItem = await prisma.userSmallItemInventory.findFirst({
    where: {
      user_id: userId,
      small_item_id: selectedItem.id,
    },
  });

  if (userSmallItem) {
    await prisma.userSmallItemInventory.update({
      where: {
        id: userSmallItem.id,
      },
      data: {
        amount: {
          increment: 1,
        },
      },
    });
  } else {
    await prisma.userSmallItemInventory.create({
      data: {
        user_id: userId,
        small_item_id: selectedItem.id,
        amount: 1,
      },
    });
  }

  await prisma.rallyActivityLog.create({
    data: {
      user_id: userId,
      message: `GACHA (+${selectedItem.name})\n -3 EONIX`,
    },
  });

  return selectedItem;
}

export async function buySmallItem(userId: string, itemId: string) {
  return await prisma.$transaction(async (tx) => {
    const rallyData = await tx.rallyData.findUnique({
      where: { user_id: userId },
    });

    const item = await tx.rallySmallItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error("ITEM NOT FOUND");
    }

    if (!rallyData || rallyData.enonix < 5) {
      throw new Error("ENONIX NOT ENOUGH (NEED 5)");
    }

    await tx.rallyData.update({
      where: { user_id: userId },
      data: { enonix: { decrement: 5 } },
    });

    const existingInventory = await tx.userSmallItemInventory.findFirst({
      where: { user_id: userId, small_item_id: itemId },
    });

    if (existingInventory) {
      await tx.userSmallItemInventory.update({
        where: { id: existingInventory.id },
        data: { amount: { increment: 1 } },
      });
    } else {
      await tx.userSmallItemInventory.create({
        data: {
          user_id: userId,
          small_item_id: itemId,
          amount: 1,
        },
      });
    }

    await tx.rallyActivityLog.create({
      data: {
        user_id: userId,
        message: `BOUGHT (${item.name}) -5 EONIX`,
      },
    });

    return true;
  });
}