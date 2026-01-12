"use server";

import prisma from "@/lib/prisma";

export interface ShopUser {
  id: string;
  name: string;
  tradingDataId: string;
  isPlayedThunt: boolean;
  usd: number;
  idr: number;
}

export interface ShopRawItem {
  id: string;
  name: string;
  price: number;
}

export async function searchUsers(query: string): Promise<ShopUser[]> {
  if (!query || query.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
      tradingData: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      tradingData: {
        select: {
          id: true,
          isPlayedThunt: true,
          usd: true,
          idr: true,
        },
      },
    },
    take: 10,
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    tradingDataId: user.tradingData?.id || "",
    isPlayedThunt: user.tradingData?.isPlayedThunt || false,
    usd: Number(user.tradingData?.usd || 0),
    idr: Number(user.tradingData?.idr || 0),
  }));
}

export async function getAllRawItems(): Promise<ShopRawItem[]> {
  const activePeriod = await prisma.periodeTrading.findFirst({
    where: {
      status: "ON_GOING",
    },
  });

  const items = await prisma.rawItem.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      rawPeriods: {
        where: {
            periode: activePeriod ? activePeriod.periode : -1
        }
      }
    }
  });

  return items.map((item) => {
    const periodData = item.rawPeriods[0];
    return {
      id: item.id,
      name: item.name,
      price: periodData ? Number(periodData.price) : 0,
    };
  });
}

export async function getUserCraftInventory(userId: string) {
  const inventory = await prisma.craftUserAmount.findMany({
    where: {
        tradingData: {
            userId: userId
        }
    },
    include: {
        craftItem: true
    }
  });

  return inventory.map(item => ({
      craftItemId: item.craftItemId,
      amount: Number(item.amount),
      name: item.craftItem.name
  }));
}
