import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can upgrade
    const adminRoles = [Role.SUPER, Role.UPGRADE];
    if (!adminRoles.includes(session.user.role as Role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get current level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { rallyData: true },
    });

    if (!user?.rallyData) {
      return NextResponse.json(
        { success: false, error: "User rally data not found" },
        { status: 404 }
      );
    }

    // Upgrade access card level
    const newLevel = user.rallyData.access_card_level + 1;
    
    const updated = await prisma.rallyData.update({
      where: { user_id: userId },
      data: { access_card_level: newLevel },
    });

    return NextResponse.json({
      success: true,
      message: "Access card upgraded successfully",
      newLevel: updated.access_card_level,
    });
  } catch (error) {
    console.error("Error upgrading access card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upgrade access card" },
      { status: 500 }
    );
  }
}