import Image from "next/image";
import BackgroundAssetsDesktop from "../../../../components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "../../../../components/common/BackgroundAssetsMobile";
import LeaderboardTrading from "../../../../components/ui/LeaderboardTrading";
import { getTradingLeaderboard } from "../../../../features/trading/services/leaderboard";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const data = await getTradingLeaderboard();
  
  // Transform data to match component interface and mark current user
  const leaderboardData = data.map(({ userId, ...item }) => ({
    ...item,
    isCurrentUser: session?.user?.id === userId
  }));

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-8 justify-center items-center py-12 px-4">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>
        
        <div className="relative z-10 w-full flex flex-col items-center gap-6">
          <Image
            src={"/assets/eternity-logo.svg"}
            alt="eternity-logo"
            draggable={false}
            width={300}
            height={300}
            className="w-48 h-auto"
          />
          
          <LeaderboardTrading 
            data={leaderboardData}
            title="Trading Leaderboard"
            currentUserId={session?.user?.id}
          />
        </div>
      </div>
    </div>
  );
}