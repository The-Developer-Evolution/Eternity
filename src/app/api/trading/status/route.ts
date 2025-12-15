import { NextResponse } from "next/server";
import { getActiveTradingPeriod } from "@/features/trading/services/timer";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");

    // If a specific period is requested, fetch that period's status
    if (periodId) {
      const period = await prisma.periodeTrading.findUnique({
        where: { id: periodId },
        select: {
          status: true,
          startTime: true,
          endTime: true,
          pausedTime: true,
        },
      });

      if (!period) {
        return NextResponse.json(
          { error: "Period not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: period.status,
        startTime: period.startTime?.toISOString(),
        endTime: period.endTime?.toISOString(),
        pausedTime: period.pausedTime?.toISOString(),
        serverTime: new Date().toISOString(),
      });
    }

    // Otherwise, fetch the active trading period (backward compatibility)
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
