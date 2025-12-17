import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserTradingById } from "@/features/user/trading.service";
import prisma from "@/lib/prisma";
import { PlayerTradingDashboard } from "@/components/trading/PlayerTradingDashboard";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Get User Data
  const userRes = await getUserTradingById(session.user.id);
  
  if (!userRes.success || !userRes.data) {
     return <div className="text-white text-center mt-20">Error loading user data: {userRes.error}</div>;
  }
  
  const tradingData = userRes.data.tradingData;

  // 2. Calculate Stats
  const rawItemAmount = tradingData.rawUserAmounts.reduce((sum, item) => sum + Number(item.amount), 0);
  const craftItemAmount = tradingData.craftUserAmounts.reduce((sum, item) => sum + Number(item.amount), 0);

  const stats = {
    usd: Number(tradingData.usd).toLocaleString('en-US'),
    idr: Number(tradingData.idr).toLocaleString('id-ID'),
    eternites: Number(tradingData.eternites).toLocaleString('id-ID'),
    mapAmount: Number(tradingData.map || 0),
    rawItemAmount,
    craftItemAmount
  };

  // 3. Get Active Period
  // Priority: ON_GOING -> PAUSED -> ENDED (Latest)
  let activePeriod = await prisma.periodeTrading.findFirst({
    where: { status: "ON_GOING" },
  });

  if (!activePeriod) {
    activePeriod = await prisma.periodeTrading.findFirst({
        where: { status: "PAUSED" },
    });
  }

  if (!activePeriod) {
    activePeriod = await prisma.periodeTrading.findFirst({
        orderBy: { periode: 'desc' }
    });
  }

  return (
    <div className="overflow-hidden min-h-screen relative">
      <BackgroundAssetsDesktop />
      <BackgroundAssetsMobile />
      <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-full h-full top-0 left-0"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen py-10 gap-8">
        <Image
          src={"/assets/eternity-logo.svg"}
          alt="eternity-logo"
          draggable={false}
          width={300}
          height={300}
          className="w-48 h-auto drop-shadow-[0_0_15px_rgba(174,0,222,0.5)]"
        />

        <div className="w-full px-4">
             <PlayerTradingDashboard 
                periodId={activePeriod?.id || null}
                initialStatus={activePeriod?.status || null}
                stats={stats}
             />
        </div>
      </div>
    </div>
  );
}
