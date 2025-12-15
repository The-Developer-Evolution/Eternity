import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { TradingAdminDashboard } from "@/components/ui/TradingAdminDashboard";
import { RallyPeriodStatus } from "@/generated/prisma/enums";
import { getActiveTradingPeriod, getAllTradingPeriods } from "@/features/trading/services/timer";

export default async function Page() {

  let initialContestStatus: RallyPeriodStatus | null = null;
  let activePeriodId: string | null = null;

  const allPeriods = await getAllTradingPeriods();

  try {
    const contest = await getActiveTradingPeriod();
    if (contest) {
      initialContestStatus = contest.status;
      activePeriodId = contest.id;
    }
  } catch (error) {
    console.warn("No active trading found.", error);
  }

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
          <TradingAdminDashboard 
            initialContestState={initialContestStatus} 
            activePeriodId={activePeriodId} 
            periods={allPeriods} 
          /> 
      </div>
    </div>
  );
}
