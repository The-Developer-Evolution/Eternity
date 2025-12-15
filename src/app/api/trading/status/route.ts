import { NextResponse } from "next/server";
import { getActiveTradingPeriod } from "@/features/trading/services/timer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trading = await getActiveTradingPeriod();

    if (!trading) {
      return NextResponse.json({
        status: "NOT_STARTED", // Default status
        startTime: null,
        endTime: null,
        serverTime: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: trading.status,
      startTime: trading.startTime?.toISOString(),
      endTime: trading.endTime?.toISOString(),
      pausedTime: trading.pausedTime?.toISOString(),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch trading status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch trading status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
