
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import CardPanel from "@/components/ui/CardPanel";
import LinkButton from "@/components/common/LinkButton";
import { FaBook} from "react-icons/fa";
import RallyLevelUpgradeRecipe from "@/components/ui/RallyLevelUpgradeRecipe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      rallyData: {
        select: {
          access_card_level: true,
        },
      },
    },
  });

  const currentLevel = user?.rallyData?.access_card_level || 1;

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-full h-full top-0 left-0"></div>
        <CardPanel title="RALLY GAMES" extraClass="my-[10%]">
          {/* Current Level Display */}
          <div className="w-full p-6 bg-black/40 border-3 border-white rounded-lg mb-6">
            <h2 className="text-white text-xl md:text-2xl font-impact mb-2">YOUR CURRENT LEVEL</h2>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-2 border-white">
                <span className="text-white text-3xl md:text-4xl font-impact">{currentLevel}</span>
              </div>
              <div>
                <p className="text-white text-lg md:text-xl font-bold">Level {currentLevel}</p>
                <p className="text-white/80 text-sm md:text-base">
                  {currentLevel >= 5 ? "MAX LEVEL REACHED! 🎉" : `${5 - currentLevel} level(s) to max`}
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Requirements */}
          <h3 className="text-white text-xl md:text-2xl font-impact mb-4">UPGRADE REQUIREMENTS</h3>
          
          <RallyLevelUpgradeRecipe levelWhatToWhat="Level 1 → Level 2">
            <li>1 Token bebas (Sigil/Chrono/Fragment Token)</li>
            <li>1 Material bebas (Shard/Rune/Flux)</li>
            <li>Stamp pos sudah bermain di 2 pos bebas</li>
            <li>5 Eonixs</li>
          </RallyLevelUpgradeRecipe>
          <RallyLevelUpgradeRecipe levelWhatToWhat="Level 2 → Level 3">
            <li>2 Token bebas (Sigil/Chrono/Fragment Token)</li>
            <li>2 Material bebas (Shard/Rune/Flux)</li>
            <li>8 Eonixs</li>
          </RallyLevelUpgradeRecipe>
          <RallyLevelUpgradeRecipe levelWhatToWhat="Level 3 → Level 4">
            <li>2 Token bebas (Sigil/Chrono/Fragment Token)</li>
            <li>3 Material bebas (Shard/Rune/Flux)</li>
            <li>Stamp pos di 3 zona berbeda</li>
            <li>12 Eonixs</li>
          </RallyLevelUpgradeRecipe>
          <RallyLevelUpgradeRecipe levelWhatToWhat="Level 4 → Level 5">
            <li>1 Sigil Token + 1 Chrono Token + 1 Fragment Token</li>
            <li>3 Material bebas (Shard/Rune/Flux)</li>
            <li>Stamp pos di 4 zona berbeda</li>
            <li>15 Eonixs</li>
          </RallyLevelUpgradeRecipe>
          <LinkButton link="/#" text="Guidebook" icon={<FaBook />}></LinkButton>
        </CardPanel>
      </div>
    </div>
  );
}
