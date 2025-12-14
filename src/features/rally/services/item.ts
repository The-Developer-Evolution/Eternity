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
            }
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

    return true;
}