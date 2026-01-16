// app/api/global-leaderboard/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Pastikan data selalu fresh

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10'); // Default 10

    // 1. Ambil semua participant beserta data point-nya
    const users = await prisma.user.findMany({
      where: {
        role: "PARTICIPANT",
      },
      select: {
        id: true,
        name: true,
        talkshowPoints: true,
        rallyData: {
          select: {
            point: true,
            access_card_level: true,
            minus_point: true,
            vault: true,
            enonix: true,
          }
        },
        tradingData: {
          select: {
            point: true
          }
        }
      }
    });

    // 2. Kalkulasi Total Point untuk SEMUA user
    // Rumus: (Rally * 45%) + (Trading * 40%) + (Talkshow * 15%)
    const processedUsers = users.map((user) => {
      const rallyData = user.rallyData;
      const vault = rallyData?.vault || 0;
      const eonix = rallyData?.enonix || 0;
      const level = rallyData?.access_card_level || 0;
      const minusPoint = rallyData?.minus_point || 0;

      // Calculate Rally Point dynamically using the new formula
      const rallyPoint = (vault * (eonix + level)) - minusPoint;
      
      const tradingPoint = Number(user.tradingData?.point || 0);
      const talkshowPoint = user.talkshowPoints || 0;

      const totalScore = (rallyPoint * 0.45) + (tradingPoint * 0.40) + (talkshowPoint * 0.15);

      return {
        id: user.id,
        name: user.name,
        access_card_level: user.rallyData?.access_card_level || 0,
        minus_point: user.rallyData?.minus_point || 0,
        vault: user.rallyData?.vault || 0,
        eonix: user.rallyData?.enonix || 0,
        totalPoints: totalScore, // Hasil kalkulasi
      };
    });

    // 3. Sorting Global (Dari Tertinggi ke Terendah)
    processedUsers.sort((a, b) => b.totalPoints - a.totalPoints);

    // 4. Pagination (Potong array sesuai halaman)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Ambil hanya data untuk halaman ini dan tambahkan Ranking Global
    const paginatedData = processedUsers.slice(startIndex, endIndex).map((user, index) => ({
      ...user,
      rank: startIndex + index + 1, // Rank absolut (misal page 2 mulai dari rank 11)
      isCurrentUser: false // Bisa diimplementasikan logic cek session jika perlu
    }));

    const totalPages = Math.ceil(processedUsers.length / limit);

    return NextResponse.json({
      data: paginatedData,
      totalPages: totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}