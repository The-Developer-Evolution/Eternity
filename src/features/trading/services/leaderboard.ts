import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export async function getTradingLeaderboard() {
  try {
    const rawData = await prisma.tradingData.findMany({
      where: {
        user: {
          role: Role.PARTICIPANT
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { idr: 'desc' },
        { usd: 'desc' },
        { eternites: 'desc' }
      ]
    });

    return rawData.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      name: entry.user.name,
      team: "-", // Placeholder as team field is missing in schema
      idr: Number(entry.idr),
      usd: Number(entry.usd),
      eternites: entry.eternites
    }));

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
