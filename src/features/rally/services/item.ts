import prisma from "@/lib/prisma";

export async function getMyInventory(userId: string) {
    const big_items = await prisma.userBigItemInventory.findMany({
        where: {
            user_id: userId,
        },
        include: {
            bigItem: true,
        }
    });

    const small_items = await prisma.userSmallItemInventory.findMany({
        where: {
            user_id: userId,
        },
        include: {
            smallItem: true,
        }
    });

    return {
        big_items,
        small_items,
    };  
}

export async function getAllBigItems() {
    const big_items = await prisma.rallyBigItemRecipe.findMany({
        include: {
            resultItem: true,
            smallItem: true
        }
    })
    return big_items;
}

export async function craftBigItem(userId: string, recipeId: string) {
    const recipe = await prisma.rallyBigItemRecipe.findUnique({
        where: {
            id: recipeId,
        },
        include: {
            resultItem: true,
        }
    });

    if (!recipe) {
        throw new Error("Recipe not found");
    }

    const userSmallItem = await prisma.userSmallItemInventory.findFirst({
        where: {
            user_id : userId,
            small_item_id : recipe.small_item_id,
        }
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
            }
        }
    });

    const userBigItem = await prisma.userBigItemInventory.findFirst({
        where: {
            user_id : userId,
            big_item_id : recipe.result_item_id,
        }
    });

    if (userBigItem) {
        await prisma.userBigItemInventory.update({
            where: {
                id: userBigItem.id,
            },
            data: {
                amount: {
                    increment: 1,
                }
            },
        });
    } else {
        await prisma.userBigItemInventory.create({
            data: {
                user_id: userId,
                big_item_id: recipe.result_item_id,
                amount: 1,
            }
        });
    }
    await prisma.rallyActivityLog.create({
        data: {
            user_id: userId,
            message: `Crafted big item ${recipe.resultItem.name}`,
        }
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
        }
    });

    if (!rallyData || rallyData.enonix < 10) {
        throw new Error("Not enough enonix for gacha");
    }

    await prisma.rallyData.update({
        where: {
            user_id: userId,
        },
        data: {
            enonix: {
                decrement: 10,
            }
        }
    });

    const randomIndex = Math.floor(Math.random() * smallItems.length);
    const selectedItem = smallItems[randomIndex];

    const userSmallItem = await prisma.userSmallItemInventory.findFirst({
        where: {
            user_id : userId,
            small_item_id : selectedItem.id,
        }
    });

    if (userSmallItem) {
        await prisma.userSmallItemInventory.update({
            where: {
                id: userSmallItem.id,
            },
            data: {
                amount: {
                    increment: 1,
                }
            }
        });
    } else {
        await prisma.userSmallItemInventory.create({
            data: {
                user_id: userId,
                small_item_id: selectedItem.id,
                amount: 1,
            }
        });
    }

    await prisma.rallyActivityLog.create({
        data: {
            user_id: userId,
            message: `Gacha item ${selectedItem.name}, costing Eonix: 10`,
        }
    });

    return selectedItem;
}