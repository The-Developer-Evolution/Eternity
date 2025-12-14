import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import LeaderboardTrading from "@/components/ui/LeaderboardTrading";

// Dummy data - replace dengan data dari database
const dummyData = Array.from({ length: 25 }, (_, i) => ({
  rank: i + 1,
  name: `Team ${i + 1}`,
  team: `Group ${String.fromCharCode(65 + (i % 5))}`,
  idr: Math.floor(Math.random() * 500000) + 100000,
  usd: Math.floor(Math.random() * 5000) + 1000,
  eternites: Math.floor(Math.random() * 100000) + 10000
})).sort((a, b) => {
  // Sort by total value (convert to IDR equivalent)
  const totalA = a.idr + (a.usd * 16000) + (a.eternites * 1000000);
  const totalB = b.idr + (b.usd * 16000) + (b.eternites * 1000000);
  return totalB - totalA;
}).map((item, index) => ({
  ...item,
  rank: index + 1
}));

export default function Page() {
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
            data={dummyData}
            title="Trading Leaderboard"
          />
        </div>
      </div>
    </div>
  );
}