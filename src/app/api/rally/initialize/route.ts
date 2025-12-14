import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only SUPER admin can initialize
    if (!session?.user || session.user.role !== Role.SUPER) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
      return NextResponse.json({
        success: true,
        created: 0,
        message: "All users already have rally data",
      });
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

    return NextResponse.json({
      success: true,
      created: result.count,
      message: `Created rally data for ${result.count} users`,
    });
  } catch (error) {
    console.error("Error initializing rally data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to initialize rally data" 
      },
      { status: 500 }
    );
  }
}