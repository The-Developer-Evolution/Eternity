import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Cached function to get current period - shared across all POS functions
const getCurrentPeriod = unstable_cache(
  async () => {
    return await prisma.rallyPeriod.findFirst({
      where: {
        status: "ON_GOING",
      },
    });
  },
  ["current-rally-period"],
  {
    tags: ["active-contest"],
    revalidate: 30, // Cache for 30 seconds
  },
);

export async function getAllPos() {
  const currentPeriod = await getCurrentPeriod();

  if (!currentPeriod) {
    return [];
  }
  const pos = await prisma.rallyPos.findMany({
    where: {
      period_id: currentPeriod.id,
      name: {
        not: "Exchange Pos",
      },
    },
    include: {
      rally_zone: true,
    },
  });

  return pos;
}

export async function getAllPosForAdmin() {
  const currentPeriod = await getCurrentPeriod();

  if (!currentPeriod) {
    return [];
  }
  const pos = await prisma.rallyPos.findMany({
    where: {
      period_id: currentPeriod.id,
    },
    include: {
      rally_zone: true,
    },
  });

  return pos;
}

export async function payPosPrice(
  pos_name: string,
  zone_id: string,
  target_user: string,
) {
  const currentPeriod = await getCurrentPeriod();

  if (!currentPeriod) {
    return null;
  }

  const posPrice = await prisma.rallyPos.findFirst({
    where: {
      name: pos_name,
      period_id: currentPeriod.id,
      zone_id: zone_id,
    },
    include: {
      rally_zone: true,
    },
  });

  if (!posPrice) {
    return null;
  }

  // Deduct eonix from user
  await prisma.rallyData.update({
    where: {
      user_id: target_user,
    },
    data: {
      enonix: {
        decrement: posPrice.eonix_cost,
      },
    },
  });

  await prisma.rallyActivityLog.create({
    data: {
      user_id: target_user,
      message: `PAID POS ${pos_name}\n -${posPrice.eonix_cost} EONIX`,
    },
  });

  return posPrice;
}
