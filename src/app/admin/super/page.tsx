import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getActiveContest, getAllRallyPeriods } from "@/features/rally/services/timer";
import { AdminDashboard } from "@/components/ui/AdminDashboard";
import { RallyPeriodStatus } from "@/generated/prisma/enums";
import { getAllTradingPeriods } from "@/features/trading/services/timer";

export default async function Page() {
  let initialContestStatus: RallyPeriodStatus | null = null;
  let activePeriodId: string | null = null;

  const allRallyPeriods = await getAllRallyPeriods();
  const allTradingPeriods = await getAllTradingPeriods();

  try {
    const contest = await getActiveContest();
    if (contest) {
      initialContestStatus = contest.status;
      activePeriodId = contest.id;
    }
  } catch (error) {
    console.warn("No active contest found.");
  }

  return (
    <div className="overflow-hidden min-h-screen relative">
      <div className="relative min-h-screen w-screen flex flex-col gap-8 justify-center items-center">
        
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-screen top-0 left-0 -z-10"></div>

        <Image
          src={"/assets/eternity-logo.svg"}
          alt="eternity-logo"
          draggable={false}
          width={1920}
          height={1080}
          className="relative z-10 w-1/3 h-auto mb-4"
        />

        <div className="relative z-20 w-full px-4">
          <h1 className="text-3xl font-impact text-center text-[#75E8F0] mb-6">
            SUPER ADMIN CONTROL
          </h1>
          
          <AdminDashboard 
            initialContestState={initialContestStatus} 
            periods={allRallyPeriods}
            activePeriodId={activePeriodId}
          />
        </div>

      </div>
    </div>
  );
}