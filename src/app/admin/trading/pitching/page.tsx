import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import PitchingInterface from "@/components/trading/PitchingInterface";
import PitchingRewardInterface from "@/components/trading/PitchingRewardInterface";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  // Guard clause for unauthenticated users (though likely handled by middleware)
  if (!session?.user) {
     return <div>Access Denied</div>;
  }

  const role = session.user.role as Role;
  
  const showFee = role === Role.SUPER || role === Role.PITCHINGGUARD;
  const showReward = role === Role.SUPER || role === Role.PITCHING;
  console.log(showFee, showReward);

  // If role is neither (and not valid), show nothing or maybe both if SUPER handles are separate
  // Based on requirement:
  // 1. PITCHINGGUARD -> Fee
  // 2. PITCHING -> Reward
  // 3. SUPER -> Both (assumed)
  
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
            {showFee && <PitchingInterface />}
            {showReward && <PitchingRewardInterface />}
            
            {!showFee && !showReward && (
                <div className="bg-red-900/50 border border-red-500 p-4 rounded text-red-200">
                    You do not have permission to view these interfaces.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
