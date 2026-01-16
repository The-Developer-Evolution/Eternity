import prisma from "@/lib/prisma";
export async function getMyRallyHistory(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.rallyActivityLog.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.rallyActivityLog.count({
      where: {
        user_id: userId,
      },
    }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}
