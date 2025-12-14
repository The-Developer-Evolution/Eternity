import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import LeaderboardRally from "@/components/ui/LeaderboardRally";
import { getLeaderBoardData } from "@/features/rally/services/user";
import { getServerSession } from "next-auth";
export default async function Page() {
  const session = await getServerSession();
  const leaderboardRaw = await getLeaderBoardData();
  const leaderboard = leaderboardRaw.map((entry, index) => ({
    rank: index + 1,
    name: entry.user.name,
    eonix: entry.point,
    access_card_level: entry.access_card_level,
    vault: entry.vault,
    minus_point: entry.minus_point,
    isCurrentUser: session?.user?.id === entry.user.id
  }));
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-8 justify-center items-center py-12 px-4">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="my-[10%] md:my-[5%] relative z-10 w-full flex flex-col items-center gap-6">
          <LeaderboardRally 
            data={leaderboard}
            title="Rally Leaderboard"
            currentUserId={session?.user?.id || ""}
          />
        </div>
      </div>
    </div>
  );
}
