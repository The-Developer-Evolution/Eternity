import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveContest } from "@/features/rally/services/timer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get active rally period
    // Get active rally period
    const activePeriod = await getActiveContest();

    if (!activePeriod) {
      return NextResponse.json({
        periodName: "No Active Period",
        periodId: null,
        status: "NOT_STARTED",
      });
    }

    return NextResponse.json({
      periodName: activePeriod.name,
      periodId: activePeriod.id,
      status: activePeriod.status,
    });
  } catch (error) {
    console.error("Failed to fetch period name:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch period name",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}