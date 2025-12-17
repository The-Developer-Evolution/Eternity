'use server'

import prisma from "@/lib/prisma";

export async function getRunningTradingPeriod() {
  const period = await prisma.periodeTrading.findFirst({
    where: {
      status: "ON_GOING", 
    },
  });

  if (!period) return null;

  if (period.endTime && period.endTime < new Date()) {
    return null;
  }

  return period;
}