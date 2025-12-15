import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import UpgradeAccessCardPanel from "@/components/ui/UpgradeAccessCardPanel";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // Authorization check
  if (!session?.user?.id) {
    return null;
  }

  const adminRoles = [
    "SUPER",
    "UPGRADE",
    "MONSTER",
    "EXCHANGE",
    "POSTGUARD",
  ];

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
          access_card_level: true,
          enonix: true,
        },
      },
    },
  });

  const mappedUsers = users.map(user => ({
    ...user,
    rallyData: user.rallyData || undefined,
  }));

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center px-4 py-8">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>

        <Image
          src="/assets/eternity-logo.svg"
          alt="eternity-logo"
          draggable={false}
          width={1920}
          height={1080}
          className="relative z-10 w-1/3 h-auto mb-4"
        />

        <div className="relative z-20 w-full max-w-2xl">
          <UpgradeAccessCardPanel users={mappedUsers} />
        </div>
      </div>
    </div>
  );
}
