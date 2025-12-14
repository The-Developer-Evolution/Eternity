import prisma from "@/lib/prisma"
export async function getMyRallyHistory(userId: string) {
    const history = await prisma.rallyActivityLog.findMany({
        where: {
            user_id: userId,
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return history;
}   