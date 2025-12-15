

import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import GachaItemPanel from "@/components/ui/GachaItemPanel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { gachaItemAction } from "@/features/rally/actions/gacha-action";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // Authorization check
  if (!session?.user?.id) {
    return null;
  }

  const adminRoles = ["SUPER", "EXCHANGE"];

  if (!adminRoles.includes(session.user.role as Role)) {
    return null;
  }

  // Fetch all participant users with their rally data
  const users = await prisma.user.findMany({
    where: {
      role: Role.PARTICIPANT,
    },
    select: {
      id: true,
      name: true,
      rallyData: {
        select: {
          enonix: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch all small items for display
  const smallItems = await prisma.rallySmallItem.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const mappedUsers = users.map((user) => ({
    ...user,
    rallyData: user.rallyData || undefined,
  }));

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center py-12">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="relative z-10 w-full max-w-4xl px-4">
          <GachaItemPanel
            users={mappedUsers}
            smallItems={smallItems}
            onGacha={gachaItemAction}
          />
        </div>
      </div>
    </div>
  );
}
