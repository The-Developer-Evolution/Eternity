import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import TreasureHuntStatusInterface from "@/components/trading/TreasureHuntStatusInterface";

export default function Page() {
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center pb-20">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>
        <Image
          src={"/assets/eternity-logo.svg"}
          alt="eternity-logo"
          draggable={false}
          width={1920}
          height={1080}
          className="relative z-1 w-1/2 h-auto"
        />
         <div className="flex flex-col w-full items-center gap-8 py-10 overflow-y-auto max-h-screen">
             <TreasureHuntStatusInterface />
        </div>
      </div>
    </div>
  );
}
