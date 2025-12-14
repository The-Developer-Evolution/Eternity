'use server'

export async function getRawAmount(
  userId: string,
  rawMaterial: RawMaterial
): Promise<number> {
  const count = await prisma.rawItem.count({
    where: {
      name: rawMaterial,
      tradingData: {
        userId,
      },
    },
  });

  return count;
}

export async function getCraftAmount(
  userId: string,
  craftItem: CraftItemLabel
): Promise<number> {
  const count = await prisma.craftItem.count({
    where: {
      name: craftItem,
      tradingData: {
        userId,
      },
    },
  });

  return count;
}