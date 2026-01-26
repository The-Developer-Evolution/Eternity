import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // 1. Fetch users with rallyData
    // We only want users who have rallyData
    const users = await prisma.user.findMany({
      where: {
        role: "PARTICIPANT",
        rallyData: {
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        rallyData: {
          select: {
            point: true,
            access_card_level: true,
            minus_point: true,
            vault: true,
            enonix: true,
          },
        },
        userBigItemInventory: {
          select: {
            amount: true,
          },
        },
        userSmallItemInventory: {
          select: {
            amount: true,
          },
        },
      },
    });

    // 2. Calculate Rally Score
    // Formula: (Vault * (Eonix + Level)) - MinusPoint
    const processedUsers = users.map((user) => {
      const vault = user.rallyData?.vault || 0;
      const eonix = user.rallyData?.enonix || 0;
      const level = user.rallyData?.access_card_level || 0;
      const minusPoint = user.rallyData?.minus_point || 0;

      // Calculate score based on user formula
      // (Vault * (Eonix + Access Card Level)) - Minus Point
      const totalBigItems = user.userBigItemInventory.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const totalSmallItems = user.userSmallItemInventory.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      const score =
        level * 1000 +
        vault * 250 +
        totalBigItems * 50 +
        totalSmallItems * 10 +
        eonix * 1 -
        minusPoint * 1;

      return {
        id: user.id,
        name: user.name,
        access_card_level: level,
        minus_point: minusPoint,
        vault: vault,
        eonix: eonix,
        score: score, // The calculated sorting metric
      };
    });

    // 3. Sort by Score (Highest to Lowest)
    processedUsers.sort((a, b) => b.score - a.score);

    // 4. Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Add Rank
    const paginatedData = processedUsers
      .slice(startIndex, endIndex)
      .map((user, index) => ({
        ...user,
        rank: startIndex + index + 1,
        isCurrentUser: false, // Placeholder for session check if needed
      }));

    const totalPages = Math.ceil(processedUsers.length / limit);

    return NextResponse.json({
      data: paginatedData,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Rally Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
