// app/api/global-leaderboard/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

// Cached function to fetch and calculate leaderboard
const getGlobalLeaderboardData = unstable_cache(
  async () => {
    const users = await prisma.user.findMany({
      where: {
        role: "PARTICIPANT",
        OR: [
          { rallyData: { isNot: null } },
          { tradingData: { isNot: null } },
          { talkshowPoints: { gt: 0 } },
        ],
      },
      select: {
        id: true,
        name: true,
        talkshowPoints: true,
        rallyData: {
          select: {
            access_card_level: true,
            minus_point: true,
            vault: true,
            enonix: true,
          },
        },
        userBigItemInventory: {
          select: { amount: true },
        },
        userSmallItemInventory: {
          select: { amount: true },
        },
        tradingData: {
          select: {
            idr: true,
          },
        },
      },
    });

    // Calculate raw scores in a single pass
    const usersWithRawScore = users.map((user) => {
      const rallyData = user.rallyData;
      const level = rallyData?.access_card_level || 0;
      const vault = rallyData?.vault || 0;
      const eonix = rallyData?.enonix || 0;
      const minusPoint = rallyData?.minus_point || 0;

      // Optimized: Calculate totals without intermediate arrays
      let totalBigItems = 0;
      for (const item of user.userBigItemInventory) {
        totalBigItems += item.amount;
      }

      let totalSmallItems = 0;
      for (const item of user.userSmallItemInventory) {
        totalSmallItems += item.amount;
      }

      // Rally score formula
      const rawRallyScore =
        level * 1000 +
        vault * 250 +
        totalBigItems * 50 +
        totalSmallItems * 10 +
        eonix -
        minusPoint;

      return {
        id: user.id,
        name: user.name,
        talkshowPoints: user.talkshowPoints,
        tradingIdr: Number(user.tradingData?.idr || 0),
        rallyData: user.rallyData,
        rawRallyScore,
      };
    });

    // Find max/min in single pass
    let maxRallyScore = 1;
    let maxTradingIdr = 0;
    let lowestTradingIdr = Number.MAX_SAFE_INTEGER;

    for (const user of usersWithRawScore) {
      if (user.rawRallyScore > maxRallyScore)
        maxRallyScore = user.rawRallyScore;
      if (user.tradingIdr > maxTradingIdr) maxTradingIdr = user.tradingIdr;
      if (user.tradingIdr < lowestTradingIdr)
        lowestTradingIdr = user.tradingIdr;
    }

    // Handle edge case
    if (lowestTradingIdr === Number.MAX_SAFE_INTEGER) lowestTradingIdr = 0;

    // Calculate final scores
    const tradingRange = maxTradingIdr - lowestTradingIdr || 1; // Prevent division by zero

    const processedUsers = usersWithRawScore.map((user) => {
      const tradingPoint = Math.max(
        0,
        (user.tradingIdr - lowestTradingIdr) / tradingRange,
      );

      const talkshowPoint = user.talkshowPoints / 600 || 0;
      const normalizedRallyScore = user.rawRallyScore / maxRallyScore;

      const totalGlobalScore =
        normalizedRallyScore * 45 + tradingPoint * 40 + talkshowPoint * 15;

      return {
        id: user.id,
        name: user.name,
        rally_level: user.rallyData?.access_card_level || 0,
        rally_vault: user.rallyData?.vault || 0,
        raw_rally_point: user.rawRallyScore,
        totalPoints: totalGlobalScore,
      };
    });

    // Sort by score (descending)
    processedUsers.sort((a, b) => b.totalPoints - a.totalPoints);

    return { processedUsers, maxRallyScore };
  },
  ["global-leaderboard"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["global-leaderboard"],
  },
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get cached data
    const { processedUsers, maxRallyScore } = await getGlobalLeaderboardData();

    // Paginate in memory (cheap operation)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = processedUsers
      .slice(startIndex, endIndex)
      .map((user, index) => ({
        ...user,
        rank: startIndex + index + 1,
      }));

    const totalPages = Math.ceil(processedUsers.length / limit);

    return NextResponse.json({
      data: paginatedData,
      meta: {
        totalPages,
        currentPage: page,
        highestRallyScore: maxRallyScore,
      },
    });
  } catch (error) {
    console.error("Global Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
