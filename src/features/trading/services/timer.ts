"use server";

import prisma from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import { cnvrtFinalIdrToIdr } from "./cnvrtFinalIdrToIdr";

export async function getAllTradingPeriods() {
  return await prisma.periodeTrading.findMany({
    orderBy: {
      periode: "asc",
    },
  });
}

export async function getActiveTradingPeriod() {
  return await prisma.periodeTrading.findFirst({
    where: {
      status: {
        in: ["ON_GOING", "PAUSED"],
      },
    },
  });
}

export async function StartTradingTimer(periodId: string, durationMinutes: number) {
  const activeTrading = await prisma.periodeTrading.findFirst({
    where: { status: "ON_GOING" },
  });

  if (activeTrading && activeTrading.id !== periodId) {
    throw new Error(`Trading Period ${activeTrading.periode} is currently running.`);
  }

  const targetPeriod = await prisma.periodeTrading.findUnique({
    where: { id: periodId },
  });

  if (!targetPeriod) throw new Error("Period not found");

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const updatedPeriod = await prisma.periodeTrading.update({
    where: { id: periodId },
    data: {
      status: "ON_GOING",
      startTime: startTime,
      endTime: endTime,
      duration: durationMinutes,
      totalPausedDuration: 0,
    },
  });

  await prisma.masterTrading.updateMany({
    data: {
      current_periode: targetPeriod.periode, 
    },
  });

  const pusher = getPusherServer();
  if (pusher) {
    try {
      console.log("Triggering trading-channel/status-update (START)...");
      await pusher.trigger("trading-channel", "status-update", {
        status: "ON_GOING",
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        periodNumber: targetPeriod.periode,
        news: targetPeriod.news,
      });
      console.log("Pusher trigger success (START).");
    } catch (error) {
      console.error("Failed to trigger Pusher event (START):", error);
    }
  }

  revalidatePath("/admin/trading", "layout");
  return updatedPeriod;
}

export async function pauseTrading() {
  const activeTrading = await prisma.periodeTrading.findFirst({
    where: { status: "ON_GOING" },
  });

  if (!activeTrading) throw new Error("No ongoing trading found.");

  const pausedTime = new Date();

  await prisma.periodeTrading.update({
    where: { id: activeTrading.id },
    data: {
      status: "PAUSED",
      pausedTime: pausedTime,
    },
  });

  const pusher = getPusherServer();
  if (pusher) {
    try {
      console.log("Triggering trading-channel/status-update (PAUSE)...");
      await pusher.trigger("trading-channel", "status-update", {
        status: "PAUSED",
      });
      console.log("Pusher trigger success (PAUSE).");
    } catch (error) {
      console.error("Failed to trigger Pusher event (PAUSE):", error);
    }
  }

  revalidatePath("/admin/trading", "layout");
}

export async function resumeTrading() {
  const pausedTrading = await prisma.periodeTrading.findFirst({
    where: { status: "PAUSED" },
  });

  if (!pausedTrading || !pausedTrading.pausedTime || !pausedTrading.endTime) {
    throw new Error("No paused trading found.");
  }

  const now = new Date();
  const pauseDuration = now.getTime() - pausedTrading.pausedTime.getTime();
  const newEndTime = new Date(pausedTrading.endTime.getTime() + pauseDuration);

  await prisma.periodeTrading.update({
    where: { id: pausedTrading.id },
    data: {
      status: "ON_GOING",
      pausedTime: null,
      endTime: newEndTime,
      totalPausedDuration: { increment: pauseDuration },
    },
  });

  const pusher = getPusherServer();
  if (pusher) {
    try {
      console.log("Triggering trading-channel/status-update (RESUME)...");
      await pusher.trigger("trading-channel", "status-update", {
        status: "ON_GOING",
        endTime: newEndTime.toISOString(),
      });
      console.log("Pusher trigger success (RESUME).");
    } catch (error) {
      console.error("Failed to trigger Pusher event (RESUME):", error);
    }
  }

  revalidatePath("/admin/trading", "layout");
}

// Conversion rates for period 8 final calculation
const CONVERSION_RATES = {
  ETERNITE_TO_IDR: BigInt(1_000_000),        // 1 eternite = 1,000,000 IDR
  MAP_TO_IDR: BigInt(106_000_000_000),       // 1 map = 106,000,000,000 IDR
  USD_TO_IDR: BigInt(15_969),                 // 1 USD = 15,969 IDR
};

const LAST_PERIOD = 8;

/**
 * Calculate final IDR for all players at the end of period 8.
 * Converts eternites, maps, and USD to IDR.
 * Raw items and craft items are NOT converted.
 */
async function calculateFinalIDR() {
  console.log("Starting final IDR calculation for all players...");
  
  // Get all trading data for participants
  const allTradingData = await prisma.tradingData.findMany({
    include: {
      user: {
        select: { role: true }
      }
    }
  });

  // Filter only participants
  const participantData = allTradingData.filter(td => td.user.role === "PARTICIPANT");
  
  console.log(`Processing ${participantData.length} participants...`);

  for (const trading of participantData) {
    // Calculate conversion amounts (using BigInt for precision)
    const eternitesValue = BigInt(trading.eternites) * CONVERSION_RATES.ETERNITE_TO_IDR;
    const mapValue = BigInt(trading.map) * CONVERSION_RATES.MAP_TO_IDR;
    const usdValue = trading.usd * CONVERSION_RATES.USD_TO_IDR;
    
    // Total conversion amount
    const totalConversion = eternitesValue + mapValue + usdValue;
    
    // Calculate final IDR value (current IDR + all conversions)
    const finalIdrValue = trading.idr + totalConversion;
    
    // Store in finalIDR string field and reset converted resources
    await prisma.tradingData.update({
      where: { id: trading.id },
      data: {
        finalIDR: finalIdrValue.toString(), // Store as string to handle large values
        idr: finalIdrValue,
        eternites: 0,
        map: 0,
        usd: BigInt(0),
      }
    });

    console.log(`Player ${trading.userId}: finalIDR = ${finalIdrValue.toString()}`);
  }

  console.log("Final IDR calculation completed.");

  // Transfer finalIDR to idr
  // await cnvrtFinalIdrToIdr();
  console.log("Final IDR transferred to IDR.");
}

export async function endTrading() {
  const activeTrading = await prisma.periodeTrading.findFirst({
    where: {
      status: {
        in: ["ON_GOING", "PAUSED"],
      },
    },
  });

  if (!activeTrading) throw new Error("No active trading to end.");

  // If this is period 8 (the last period), calculate final IDR for all players
  if (activeTrading.periode === LAST_PERIOD) {
    console.log("Period 8 ending - running final IDR calculation...");
    await calculateFinalIDR();
  }

  await prisma.periodeTrading.update({
    where: { id: activeTrading.id },
    data: {
      status: "ENDED",
      endTime: new Date(),
    },
  });

  const pusher = getPusherServer();
  if (pusher) {
    try {
      console.log("Triggering trading-channel/status-update (END)...");
      await pusher.trigger("trading-channel", "status-update", {
        status: "ENDED",
      });
      console.log("Pusher trigger success (END).");
    } catch (error) {
      console.error("Failed to trigger Pusher event (END):", error);
    }
  }

  revalidatePath("/admin/trading");
}