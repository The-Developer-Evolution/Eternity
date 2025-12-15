"use server";

import prisma from "@/lib/prisma";

export interface ShopUser {
  id: string;
  name: string;
  tradingDataId: string;
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
        },
      },
    },
    take: 10,
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    tradingDataId: user.tradingData?.id || "",
  }));
}

export async function getAllRawItems(): Promise<ShopRawItem[]> {
  const items = await prisma.rawItem.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
  }));
}
