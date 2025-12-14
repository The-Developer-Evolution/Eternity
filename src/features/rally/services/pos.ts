import prisma from "@/lib/prisma";

export async function getAllPos() 
{
    const currentPeriod = await prisma.rallyPeriod.findFirst({
        where: {
            status: "ON_GOING",
        }
    });

    if(!currentPeriod) {
        return [];
    }
    const pos = await prisma.rallyPos.findMany({
        where: {
            period_id: currentPeriod.id,
            name: {
                not: "Exchange Pos"
            }
        },
        include: {
            rally_zone: true,
        }
    });

    return pos;
}