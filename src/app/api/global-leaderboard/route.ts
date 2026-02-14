// app/api/global-leaderboard/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const users = await prisma.user.findMany({
      where: {
        role: "PARTICIPANT",
        OR: [
          { rallyData: { isNot: null } },
          { tradingData: { isNot: null } },
          { talkshowPoints: { gt: 0 } }
        ]
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
          }
        },
        // Inventory sekarang menggunakan BigInt di database
        userBigItemInventory: {
          select: { amount: true }
        },
        userSmallItemInventory: {
          select: { amount: true }
        },
        tradingData: {
          select: {
            idr: true, // Decimal (mendukung angka besar + koma)
          }
        }
      }
    });

    const usersWithRawScore = users.map((user) => {
      const rallyData = user.rallyData;
      const level = rallyData?.access_card_level || 0;
      const vault = rallyData?.vault || 0;
      const eonix = rallyData?.enonix || 0;
      const minusPoint = rallyData?.minus_point || 0;

      // PENTING: Konversi BigInt ke Number agar bisa dijumlahkan
      const totalBigItems = user.userBigItemInventory.reduce((sum, item) => 
        sum + Number(item.amount), 0
      );
      const totalSmallItems = user.userSmallItemInventory.reduce((sum, item) => 
        sum + Number(item.amount), 0
      );

      const rawRallyScore = 
        (level * 1000) + 
        (vault * 250) + 
        (totalBigItems * 50) + 
        (totalSmallItems * 10) + 
        (eonix * 1) - 
        (minusPoint * 1);

      return { ...user, rawRallyScore };
    });

    const maxRallyScore = Math.max(...usersWithRawScore.map(u => u.rawRallyScore), 0) || 1;

    const processedUsers = usersWithRawScore.map((user) => {
      // PENTING: Konversi Decimal (IDR) ke Number untuk pembagian 1 Miliar
      // Decimal dari Prisma bisa langsung di-Number-kan
      const idrValue = user.tradingData?.idr ? Number(user.tradingData.idr) : 0;
      const tradingPoint = Math.max(0, idrValue / 1_000_000_000);
      
      const talkshowPoint = user.talkshowPoints || 0;
      const normalizedRallyScore = (user.rawRallyScore / maxRallyScore);
      
      const totalGlobalScore = 
        (normalizedRallyScore * 0.45) + 
        (tradingPoint * 0.40) + 
        (talkshowPoint * 0.15);

      return {
        id: user.id,
        name: user.name,
        rally_level: user.rallyData?.access_card_level || 0,
        raw_rally_point: user.rawRallyScore,
        // Gunakan .toFixed(2) jika ingin membatasi koma di UI
        totalPoints: totalGlobalScore, 
      };
    });

    processedUsers.sort((a, b) => b.totalPoints - a.totalPoints);

    const startIndex = (page - 1) * limit;
    const paginatedData = processedUsers.slice(startIndex, startIndex + limit).map((user, index) => ({
      ...user,
      rank: startIndex + index + 1,
    }));

    return NextResponse.json({
      data: paginatedData,
      meta: {
        totalPages: Math.ceil(processedUsers.length / limit),
        currentPage: page,
        highestRallyScore: maxRallyScore
      }
    });

  } catch (error) {
    console.error("Global Leaderboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}