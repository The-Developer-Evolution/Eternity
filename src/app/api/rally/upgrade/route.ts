import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { NextResponse } from "next/server";
import { upgradeAccessCard } from "@/features/rally/services/upgrade";

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
    const adminRoles: Role[] = [Role.SUPER, Role.UPGRADE];
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

    // Upgrade access card logic via service
    const updated = await upgradeAccessCard(userId);

    return NextResponse.json({
      success: true,
      message: "Access card upgraded successfully",
      newLevel: updated.access_card_level,
    });
  } catch (error) {
    console.error("Error upgrading access card:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upgrade access card";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 } // Or 400 depending on logic, but 500 is safe for now or logic errors
    );
  }
}