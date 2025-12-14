import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import LeaderboardRally from "@/components/ui/LeaderboardRally";

// Dummy data - replace dengan data dari database
const dummyData = Array.from({ length: 25 }, (_, i) => ({
  rank: i + 1,
  name: `Team ${i + 1}`,
  team: `Group ${String.fromCharCode(65 + (i % 5))}`,
  vault: Math.floor(Math.random() * 100),
  smallItems: Math.floor(Math.random() * 50),
  bigItems: Math.floor(Math.random() * 20),
  eonix: Math.floor(Math.random() * 10),
  level: Math.floor(Math.random() * 10) + 1,
  isCurrentUser: i === 15 // Simulasi user di rank 16
})).sort((a, b) => {
  if (b.vault !== a.vault) return b.vault - a.vault;
  if (b.bigItems !== a.bigItems) return b.bigItems - a.bigItems;
  if (b.smallItems !== a.smallItems) return b.smallItems - a.smallItems;
  if (b.eonix !== a.eonix) return b.eonix - a.eonix;
  return b.level - a.level;
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
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="my-[10%] md:my-[5%] relative z-10 w-full flex flex-col items-center gap-6">
          <LeaderboardRally 
            data={dummyData}
            title="Rally Leaderboard"
          />
        </div>
      </div>
    </div>
  );
}
