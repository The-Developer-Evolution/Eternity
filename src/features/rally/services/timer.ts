"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { revalidatePath } from "next/cache";

// Fungsi helper untuk initialize rally data
async function initializeRallyDataForAllUsers() {
  try {
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    // Get users yang sudah punya rally data
    const usersWithRallyData = await prisma.rallyData.findMany({
      select: { user_id: true },
    });

    const existingUserIds = new Set(usersWithRallyData.map(rd => rd.user_id));

    // Filter users yang belum punya rally data
    const usersNeedingRallyData = allUsers.filter(
      user => !existingUserIds.has(user.id)
    );

    if (usersNeedingRallyData.length === 0) {
      return { success: true, created: 0, message: "All users already have rally data" };
    }

    // Create rally data for users yang belum punya
    const result = await prisma.rallyData.createMany({
      data: usersNeedingRallyData.map(user => ({
        user_id: user.id,
        enonix: 0,
        access_card_level: 1,
        vault: 0,
        point: 0,
        minus_point: 0,
      })),
    });

    return { 
      success: true, 
      created: result.count, 
      message: `Created rally data for ${result.count} users` 
    };
  } catch (error) {
    console.error("Error initializing rally data:", error);
    return { 
      success: false, 
      created: 0, 
      error: error instanceof Error ? error.message : "Failed to initialize rally data" 
    };
  }
}

export async function getAllRallyPeriods() {
  return await prisma.rallyPeriod.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export async function getActiveContest() {
  return await prisma.rallyPeriod.findFirst({
    where: {
      status: {
        in: ["ON_GOING", "PAUSED", "ENDED"],
      },
    },
  });
}

export async function StartContestTimer(periodId: string, durationMinutes: number) {
  // Initialize rally data untuk semua users jika belum ada
  await initializeRallyDataForAllUsers();

  const activeContest = await prisma.rallyPeriod.findFirst({
    where: { status: "ON_GOING" },
  });

  if (activeContest && activeContest.id !== periodId) {
    throw new Error(`Contest ${activeContest.name} is currently running.`);
  }

  const targetPeriod = await prisma.rallyPeriod.findUnique({
    where: { id: periodId },
  });

  if (!targetPeriod) throw new Error("Period not found");

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const updatedPeriod = await prisma.rallyPeriod.update({
    where: { id: periodId },
    data: {
      status: "ON_GOING",
      startTime: startTime,
      endTime: endTime,
      duration: durationMinutes,
      totalPausedDuration: 0,
    },
  });

  await prisma.rallyMaster.updateMany({
    data: {
      current_period_id: parseInt(periodId), 
    },
  });

  await pusherServer.trigger("contest-channel", "status-update", {
    status: "ON_GOING",
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });

  revalidatePath("/admin/super");
  return updatedPeriod;
}

export async function pauseContest() {
  const activeContest = await prisma.rallyPeriod.findFirst({
    where: { status: "ON_GOING" },
  });

  if (!activeContest) throw new Error("No ongoing contest found.");

  const pausedTime = new Date();

  await prisma.rallyPeriod.update({
    where: { id: activeContest.id },
    data: {
      status: "PAUSED",
      pausedTime: pausedTime,
    },
  });

  await pusherServer.trigger("contest-channel", "status-update", {
    status: "PAUSED",
  });

  revalidatePath("/admin/super");
}

export async function resumeContest() {
  const pausedContest = await prisma.rallyPeriod.findFirst({
    where: { status: "PAUSED" },
  });

  if (!pausedContest || !pausedContest.pausedTime || !pausedContest.endTime) {
    throw new Error("No paused contest found.");
  }

  const now = new Date();
  const pauseDuration = now.getTime() - pausedContest.pausedTime.getTime();
  const newEndTime = new Date(pausedContest.endTime.getTime() + pauseDuration);

  await prisma.rallyPeriod.update({
    where: { id: pausedContest.id },
    data: {
      status: "ON_GOING",
      pausedTime: null,
      endTime: newEndTime,
      totalPausedDuration: { increment: pauseDuration },
    },
  });

  await pusherServer.trigger("contest-channel", "status-update", {
    status: "ON_GOING",
    endTime: newEndTime.toISOString(),
  });

  revalidatePath("/admin/super");
}

export async function endContest() {
  const activeContest = await prisma.rallyPeriod.findFirst({
    where: {
      status: {
        in: ["ON_GOING", "PAUSED"],
      },
    },
  });

  if (!activeContest) throw new Error("No active contest to end.");

  await prisma.rallyPeriod.update({
    where: { id: activeContest.id },
    data: {
      status: "ENDED",
      endTime: new Date(),
    },
  });

  await pusherServer.trigger("contest-channel", "status-update", {
    status: "ENDED",
  });

  revalidatePath("/admin/super");
}