import { NextResponse } from "next/server";
import { getActiveContest } from "@/features/rally/services/timer";
import { RallyPeriodStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contest = await getActiveContest();

    // PERBAIKAN: Cek jika contest null (belum ada yg aktif)
    if (!contest) {
      return NextResponse.json({
        status: "NOT_STARTED", // Default status jika tidak ada data
        startTime: null,
        endTime: null,
        serverTime: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: contest.status,
      startTime: contest.startTime?.toISOString(),
      endTime: contest.endTime?.toISOString(),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch contest status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contest status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}