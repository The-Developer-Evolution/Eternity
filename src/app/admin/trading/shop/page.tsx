import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import ShopInterface from "@/components/trading/ShopInterface";
import TradingTimer from "@/components/trading/TradingTimer";
import { getAllRawItems } from "@/features/trading/services/shop";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rawItems = await getAllRawItems();

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0"></div>
        <Image
          src={"/assets/eternity-logo.svg"}
          alt="eternity-logo"
          draggable={false}
          width={1920}
          height={1080}
          className="relative z-1 w-1/2 h-auto"
        ></Image>
        <div className="flex flex-col w-full items-center gap-6 relative z-10 pb-10">
            <TradingTimer />
            <ShopInterface initialItems={rawItems} />
        </div>
      </div>
    </div>
  );
}
