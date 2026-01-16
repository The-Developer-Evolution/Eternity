"use server";

import prisma from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

async function initializeRallyDataForAllUsers() {
  try {
    // Get all users
    // Optimized: Only fetch users who DO NOT have rallyData
    const usersNeedingRallyData = await prisma.user.findMany({
      where: {
        rallyData: null,
      },
      select: { id: true },
    });

    if (usersNeedingRallyData.length === 0) {
      return {
        success: true,
        created: 0,
        message: "All users already have rally data",
      };
    }

    // Create rally data for users yang belum punya
    // Create many is efficient
    const result = await prisma.rallyData.createMany({
      data: usersNeedingRallyData.map((user) => ({
        user_id: user.id,
        enonix: 15,
        access_card_level: 1,
        vault: 0,
        point: 0,
        minus_point: 0,
      })),
      skipDuplicates: true, 
    });

    return {
      success: true,
      created: result.count,
      message: `Created rally data for ${result.count} users`,
    };
  } catch (error) {
    console.error("Error initializing rally data:", error);
    return {
      success: false,
      created: 0,
      error:
        error instanceof Error
          ? error.message
          : "Failed to initialize rally data",
    };
  }
}

export async function addEonixToAllUsers(amount: number) {
  const users = await prisma.rallyData.findMany({ select: { user_id: true } });

  if (users.length === 0) {
    return { success: false, message: "No users with rally data found" };
  }

  const updated = await prisma.rallyData.updateMany({
    data: {
      enonix: { increment: amount },
    },
  });

  const logs = users.map((u) => ({
    message: `+${amount} PERIOD EONIX`,
    user_id: u.user_id,
  }));

  const BATCH_SIZE = 1000;
  
  // Create logs in batches to prevent memory/query size issues
  for (let i = 0; i < logs.length; i += BATCH_SIZE) {
    const batch = logs.slice(i, i + BATCH_SIZE);
    await prisma.rallyActivityLog.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  return { success: true, updatedCount: updated.count, createdLogs: logs.length };
}

export async function getAllRallyPeriods() {
  return await prisma.rallyPeriod.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

// Optimized getActiveContest with caching
export const getActiveContest = unstable_cache(
  async () => {
    return await prisma.rallyPeriod.findFirst({
      where: {
        status: {
          in: ["ON_GOING", "PAUSED"],
        },
      },
    });
  },
  ["active-contest"],
  {
    tags: ["active-contest"],
    revalidate: 60, // Fallback revalidation every 60s
  }
);

export async function StartContestTimer(
  periodId: string,
  durationMinutes: number
) {
  // Initialize rally data untuk semua users jika belum ada
  await initializeRallyDataForAllUsers();

  // Note: calling the cached version here is fine for checking existence, unless we need absolutely fresh data. 
  // Given StartContest is an admin action, we might prefer fresh data, but consistency with the rest of the app suggests using the cached function or direct prisma call. 
  // For safety in this critical mutation, let's stick to direct prisma call or ensure we handle it correctly. 
  // But to stick to the pattern, let's use direct prisma for critical checks to avoid race conditions from stale cache.
  
  const activeContest = await prisma.rallyPeriod.findFirst({
    where: { status: "ON_GOING" },
  });

  if (activeContest && activeContest.id !== periodId) {
    throw new Error(
      `Contest ${activeContest.name} is currently running. Stop it before starting a new one.`
    );
  }

  const targetPeriod = await prisma.rallyPeriod.findUnique({
    where: { id: periodId },
  });

  if (!targetPeriod) throw new Error("Period not found");

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const rallyMaster = await prisma.rallyMaster.findFirst();
  if (!rallyMaster) {
    await prisma.rallyMaster.create({
      data: { current_period_id: targetPeriod.id, total_period: 1 },
    });
  } else {
    const updated = await prisma.rallyMaster.update({
      where: { id: rallyMaster.id },
      data: {
        current_period_id: targetPeriod.id,
        total_period: { increment: 1 },
      },
    });
    if (!updated) throw new Error("Failed to update rally master");
    switch (rallyMaster.total_period) {
      case 2:
        await addEonixToAllUsers(2);
        break;
      case 3:
        await addEonixToAllUsers(4);
        break;
      case 4:
        await addEonixToAllUsers(3);
        break;
      case 5:
        await addEonixToAllUsers(2);
        break;
      case 6:
        await addEonixToAllUsers(4);
        break;
      case 7:
        await addEonixToAllUsers(5);
        break;
      case 8:
        await addEonixToAllUsers(4);
        break;
      default:
        break;
    }
  }

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

  // Trigger Pusher dengan period name
  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger("contest-channel", "status-update", {
      status: "ON_GOING",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      periodName: updatedPeriod.name,
      periodId: updatedPeriod.id,
    });
  }

  revalidatePath("/admin/super");
  revalidatePath("/peserta/rally");
  revalidateTag("active-contest"); 
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

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger("contest-channel", "status-update", {
      status: "PAUSED",
    });
  }

  revalidatePath("/admin/super");
  revalidateTag("active-contest");
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

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger("contest-channel", "status-update", {
      status: "ON_GOING",
      endTime: newEndTime.toISOString(),
    });
  }

  revalidatePath("/admin/super");
  revalidateTag("active-contest");
}

export async function endContest() {
  const activeContest = await prisma.rallyPeriod.findFirst({
    where: {
      status: {
        in: ["ON_GOING", "PAUSED"],
      },
    },
  });

  if (!activeContest) {
    return { success: false, message: "No active contest to end." };
  }

  await prisma.rallyPeriod.update({
    where: { id: activeContest.id },
    data: {
      status: "ENDED",
      endTime: new Date(),
    },
  });

  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger("contest-channel", "status-update", {
      status: "ENDED",
      periodName: activeContest.name,
      periodId: activeContest.id,
    });
  }

  revalidatePath("/admin/super");
  revalidatePath("/peserta/rally");
  revalidateTag("active-contest");
  
  return { success: true, message: "Contest ended successfully." };
}
