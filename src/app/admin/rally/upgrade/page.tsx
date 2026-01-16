import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import UpgradeAccessCardPanel from "@/components/ui/UpgradeAccessCardPanel";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // Authorization check
  if (!session?.user?.id) {
    return null;
  }

  const adminRoles = ["SUPER", "UPGRADE"];

  if (!adminRoles.includes(session.user.role as Role)) {
    return null;
  }

  // Fetch all participant users with their rally data AND inventory
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
      // Include Big Item Inventory
      userBigItemInventory: {
        select: {
          id: true,
          amount: true,
          big_item_id: true,
          bigItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      // Include Small Item Inventory
      userSmallItemInventory: {
        select: {
          id: true,
          amount: true,
          small_item_id: true,
          smallItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Map the data to match component interface
  const mappedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    rallyData: user.rallyData || undefined,
    bigItemInventory: user.userBigItemInventory.map(inv => ({
      id: inv.bigItem.id,
      name: inv.bigItem.name,
      amount: inv.amount,
    })),
    smallItemInventory: user.userSmallItemInventory.map(inv => ({
      id: inv.smallItem.id,
      name: inv.smallItem.name,
      amount: inv.amount,
    })),
  }));

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center px-4 py-8">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>
        <UpgradeAccessCardPanel users={mappedUsers} />
      </div>
    </div>
  );
}
