import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import CardPanel from "@/components/ui/CardPanel";
import LinkButton from "@/components/common/LinkButton";
import { FaBook} from "react-icons/fa";
import RallyLevelUpgradeRecipe from "@/components/ui/RallyLevelUpgradeRecipe";

export default function Page() {
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-full h-full top-0 left-0"></div>
        <CardPanel title="RALLY GAMES" period="Spring" extraClass="my-[10%]">
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
