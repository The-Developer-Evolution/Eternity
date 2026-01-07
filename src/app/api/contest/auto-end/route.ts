import { NextResponse } from "next/server";
import { endContest } from "@/features/rally/services/timer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await endContest();
    
    return NextResponse.json({ 
      success: true, 
      message: "Contest ended automatically" 
    });
  } catch (error) {
    console.error("Auto-end failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to end contest" 
      },
      { status: 500 }
    );
  }
}