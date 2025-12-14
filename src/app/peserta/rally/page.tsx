import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import CardPanel from "@/components/ui/CardPanel";
import LinkButton from "@/components/common/LinkButton";
import { FaBook, FaChartBar, FaHistory, FaIdCard, FaBox, FaHouseUser, FaTable } from "react-icons/fa";

export default function Page() {
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>
        <CardPanel title="RALLY GAMES" period="Spring">
          <div className="flex flex-col gap-2 h-full w-full justify-center items-center">
            <LinkButton link="/peserta/rally/leaderboard" text="Leaderboard" icon={<FaChartBar />}></LinkButton>
            <LinkButton link="/peserta/rally/access-card" text="Access Card" icon={<FaIdCard />}></LinkButton>
            <LinkButton link="/peserta/rally/craft" text="Craft" icon={<FaTable />}></LinkButton>
            <LinkButton link="/peserta/rally/inventory" text="Inventory" icon={<FaBox />}></LinkButton>
            <LinkButton link="/peserta/rally/activity-log" text="Activity Log" icon={<FaHistory />}></LinkButton>
            <LinkButton link="/peserta/rally/pos" text="Pos" icon={<FaHouseUser />}></LinkButton>
          </div>
          <LinkButton link="/#" text="Guidebook" icon={<FaBook />}></LinkButton>
        </CardPanel>
      </div>
    </div>
  );
}
