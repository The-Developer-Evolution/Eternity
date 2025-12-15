"use server";

import prisma from "@/lib/prisma";

import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";


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
        in: ["ON_GOING"],
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

  await pusherServer.trigger("trading-channel", "status-update", {
    status: "ON_GOING",
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });

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

  await pusherServer.trigger("trading-channel", "status-update", {
    status: "PAUSED",
  });

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

  await pusherServer.trigger("trading-channel", "status-update", {
    status: "ON_GOING",
    endTime: newEndTime.toISOString(),
  });

  revalidatePath("/admin/trading", "layout");
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

  await prisma.periodeTrading.update({
    where: { id: activeTrading.id },
    data: {
      status: "ENDED",
      endTime: new Date(),
    },
  });

  await pusherServer.trigger("trading-channel", "status-update", {
    status: "ENDED",
  });

  revalidatePath("/admin/trading");
}