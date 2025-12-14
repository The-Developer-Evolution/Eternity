import prisma from "@/lib/prisma";

export async function getLeaderBoardData() {
  const leaderboard = await prisma.rallyData.findMany({
    orderBy: [
      { point: "desc" },
      { vault: "desc" },
      { enonix: "desc" },
      { minus_point: "asc" }
    ],
    include: {
      user: true
    },
    where: {
      NOT: {
        vault: 0
      }
    }
  })
  
  return leaderboard;
}