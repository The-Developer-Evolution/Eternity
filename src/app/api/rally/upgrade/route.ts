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
    const adminRoles: Role[] = [Role.SUPER, Role.UPGRADE];
    if (!adminRoles.includes(session.user.role as Role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { 
      userId, 
      eonixCost, 
      bigItems, // Array of { id: string, amount: number }
      smallItems // Array of { id: string, amount: number }
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's rally data
    const rallyData = await prisma.rallyData.findUnique({
      where: { user_id: userId },
    });

    if (!rallyData) {
      return NextResponse.json(
        { success: false, error: "User rally data not found" },
        { status: 404 }
      );
    }

    // Check if user has enough Eonix
    if (rallyData.enonix < eonixCost) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Not enough Eonix. Required: ${eonixCost}, Available: ${rallyData.enonix}` 
        },
        { status: 400 }
      );
    }

    // Check if user can still upgrade
    if (rallyData.access_card_level >= 5) {
      return NextResponse.json(
        { success: false, error: "Access card is already at maximum level" },
        { status: 400 }
      );
    }

    // Validate Big Items
    if (bigItems && bigItems.length > 0) {
      for (const item of bigItems) {
        const inventory = await prisma.userBigItemInventory.findFirst({
          where: {
            user_id: userId,
            big_item_id: item.id,
          },
        });

        if (!inventory || inventory.amount < item.amount) {
          const itemName = await prisma.rallyBigItem.findUnique({
            where: { id: item.id },
            select: { name: true }
          });
          return NextResponse.json(
            { 
              success: false, 
              error: `Not enough ${itemName?.name || 'Big Item'}. Required: ${item.amount}, Available: ${inventory?.amount || 0}` 
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate Small Items
    if (smallItems && smallItems.length > 0) {
      for (const item of smallItems) {
        const inventory = await prisma.userSmallItemInventory.findFirst({
          where: {
            user_id: userId,
            small_item_id: item.id,
          },
        });

        if (!inventory || inventory.amount < item.amount) {
          const itemName = await prisma.rallySmallItem.findUnique({
            where: { id: item.id },
            select: { name: true }
          });
          return NextResponse.json(
            { 
              success: false, 
              error: `Not enough ${itemName?.name || 'Small Item'}. Required: ${item.amount}, Available: ${inventory?.amount || 0}` 
            },
            { status: 400 }
          );
        }
      }
    }

    // Perform upgrade transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct Eonix and Upgrade Level
      const updatedRallyData = await tx.rallyData.update({
        where: { user_id: userId },
        data: {
          enonix: { decrement: eonixCost },
          access_card_level: { increment: 1 },
        },
      });

      // Deduct Big Items
      if (bigItems && bigItems.length > 0) {
        for (const item of bigItems) {
          const inventory = await tx.userBigItemInventory.findFirst({
            where: {
              user_id: userId,
              big_item_id: item.id,
            },
          });

          if (inventory) {
            await tx.userBigItemInventory.update({
              where: { id: inventory.id },
              data: { amount: { decrement: item.amount } },
            });
          }
        }
      }

      // Deduct Small Items
      if (smallItems && smallItems.length > 0) {
        for (const item of smallItems) {
          const inventory = await tx.userSmallItemInventory.findFirst({
            where: {
              user_id: userId,
              small_item_id: item.id,
            },
          });

          if (inventory) {
            await tx.userSmallItemInventory.update({
              where: { id: inventory.id },
              data: { amount: { decrement: item.amount } },
            });
          }
        }
      }

      // Create activity log
      const itemsUsed = [
        ...(bigItems || []).map((i: { id: string; amount: number }) => `Big Item ID ${i.id}: ${i.amount}x`),
        ...(smallItems || []).map((i: { id: string; amount: number }) => `Small Item ID ${i.id}: ${i.amount}x`),
      ].join(", ");

      await tx.rallyActivityLog.create({
        data: {
          user_id: userId,
          message: `Upgraded Access Card to level ${updatedRallyData.access_card_level}. Cost: ${eonixCost} Eonix${itemsUsed ? `, Items: ${itemsUsed}` : ''}`,
        },
      });

      return updatedRallyData;
    });

    return NextResponse.json({
      success: true,
      message: "Access card upgraded successfully",
      newLevel: result.access_card_level,
    });
  } catch (error) {
    console.error("Error upgrading access card:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upgrade access card";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}