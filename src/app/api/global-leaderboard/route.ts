// app/api/global-leaderboard/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 1. Ambil data User beserta SEMUA komponen yang dibutuhkan rumus
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
        // Tambahkan fetch inventory untuk rumus baru
        userBigItemInventory: {
          select: { amount: true }
        },
        userSmallItemInventory: {
          select: { amount: true }
        },
        tradingData: {
          select: {
            idr: true,
          }
        }
      }
    });

    // 2. Tahap 1: Hitung RAW RALLY SCORE untuk setiap user
    // Kita perlu array sementara ini untuk mencari nilai Highest Point yang akurat sesuai rumus
    const usersWithRawScore = users.map((user) => {
      const rallyData = user.rallyData;
      const level = rallyData?.access_card_level || 0;
      const vault = rallyData?.vault || 0;
      const eonix = rallyData?.enonix || 0;
      const minusPoint = rallyData?.minus_point || 0;

      // Hitung total item dari inventory
      const totalBigItems = user.userBigItemInventory.reduce((sum, item) => sum + item.amount, 0);
      const totalSmallItems = user.userSmallItemInventory.reduce((sum, item) => sum + item.amount, 0);

      // --- RUMUS BARU RALLY POINT ---
      // Level * 1000 + Vault * 250 + BigItems * 50 + SmallItems * 10 + Eonix - MinusPoint
      const rawRallyScore = 
        (level * 1000) + 
        (vault * 250) + 
        (totalBigItems * 50) + 
        (totalSmallItems * 10) + 
        (eonix * 1) - 
        (minusPoint * 1);

      return {
        ...user,
        rawRallyScore // Simpan skor mentah untuk dibandingkan nanti
      };
    });

    // 3. Cari Highest Point dari hasil hitungan di atas
    // Jika tidak ada user atau max score 0, set jadi 1 (agar tidak divide by zero)
    const maxRallyScore = Math.max(...usersWithRawScore.map(u => u.rawRallyScore), 0) || 1;

    // 4. Tahap 2: Kalkulasi FINAL GLOBAL SCORE (dengan bobot %)
    const processedUsers = usersWithRawScore.map((user) => {
      // a. Hitung poin Trading (IDR / 1 Milyar)
      const tradingPoint = Math.max(0, Number(user.tradingData?.idr || 0) / 1_000_000_000);
      
      // b. Hitung poin Talkshow
      const talkshowPoint = user.talkshowPoints || 0;

      // c. Hitung Global Score
      // (RallyScoreUser / MaxRallyScore * 45%) + (Trading * 40%) + (Talkshow * 15%)
      const normalizedRallyScore = (user.rawRallyScore / maxRallyScore);
      
      const totalGlobalScore = 
        (normalizedRallyScore * 0.45) + 
        (tradingPoint * 0.40) + 
        (talkshowPoint * 0.15);

      return {
        id: user.id,
        name: user.name,
        // Data pendukung untuk ditampilkan di UI (opsional)
        rally_level: user.rallyData?.access_card_level || 0,
        rally_vault: user.rallyData?.vault || 0,
        raw_rally_point: user.rawRallyScore, // Nilai asli Rally point
        totalPoints: totalGlobalScore, // Nilai akhir untuk sorting leaderboard global
      };
    });

    // 5. Sorting Global (Tertinggi ke Terendah)
    processedUsers.sort((a, b) => b.totalPoints - a.totalPoints);

    // 6. Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedData = processedUsers.slice(startIndex, endIndex).map((user, index) => ({
      ...user,
      rank: startIndex + index + 1,
    }));

    const totalPages = Math.ceil(processedUsers.length / limit);

    return NextResponse.json({
      data: paginatedData,
      meta: {
        totalPages,
        currentPage: page,
        highestRallyScore: maxRallyScore // Info tambahan jika perlu debug nilai pembagi
      }
    });

  } catch (error) {
    console.error("Global Leaderboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}