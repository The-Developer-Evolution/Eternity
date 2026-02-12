export const dynamic = 'force-dynamic';

import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import LeaderboardRally from "@/components/ui/LeaderboardRally";
import prisma from "@/lib/prisma";

export default async function Page() {
  const period = await prisma.rallyPeriod.findFirst({
    where: {
      id: "8"
    }
  });

  const renderLeaderboard = () => (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-8 justify-center items-center py-12 px-4">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="my-[10%] md:my-[5%] relative z-10 w-full flex flex-col items-center gap-6">
          <LeaderboardRally title="Rally Leaderboard" />
        </div>
      </div>
    </div>
  );

  if (period) {
    if (period.status === "ENDED" || period.status === "ON_GOING") {
      return (
       null
      );
    }
    return  renderLeaderboard();
  } else {
    return renderLeaderboard();
  }
}