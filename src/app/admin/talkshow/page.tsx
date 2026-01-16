import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import TalkshowAdminPanel from "@/components/ui/TalkshowAdminPanel";
import { updateTalkshowPoints } from "@/features/user/talkshow";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const adminRoles = [
    "SUPER",
    "TALKSHOW",
  ];

  if (!adminRoles.includes(session.user.role as Role)) {
    return null;
  }

  const users = await prisma.user.findMany({
    where: {
      role: Role.PARTICIPANT,
    },
    select: {
      id: true,
      name: true,
      totalPoints: true,
      talkshowPoints: true,
      rallyData: {
        select: {
          minus_point: true,
          point: true,
        },
      },
      tradingData:{
        select:{
          point: true,
        }
      }
    },
    orderBy: {
      name: "asc",
    },
  });

  const mappedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    totalPoints: Number(user.totalPoints),
    talkshowPoints: user.talkshowPoints,
    rallyData: user.rallyData ? {
      minus_point: Number(user.rallyData.minus_point),
      point: Number(user.rallyData.point),
    } : undefined,
    tradingData: user.tradingData ? {
      point: Number(user.tradingData.point),
    } : undefined,
  }));

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center py-12">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <TalkshowAdminPanel users={mappedUsers} onUpdatePoints={updateTalkshowPoints} />
      </div>
    </div>
  );
}