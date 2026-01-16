import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserTradingById } from "@/features/user/trading.service";
import prisma from "@/lib/prisma";
import { PlayerTradingDashboard } from "@/components/trading/PlayerTradingDashboard";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);
    
  // Check session first
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Wrap everything in try-catch for debugging
  try {

    // 1. Get User Data
    const userRes = await getUserTradingById(session.user.id);
    
    if (!userRes.success || !userRes.data) {
      return (
        <div className="min-h-screen bg-[#000F46] flex items-center justify-center">
          <div className="bg-red-900/80 text-white text-center p-8 rounded-xl border border-red-500 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Error Loading Trading Data</h2>
            <p className="text-red-200">{userRes.error || "Unknown error occurred"}</p>
          </div>
        </div>
      );
    }
    
    const tradingData = userRes.data.tradingData;

    // Extra safety check for tradingData
    if (!tradingData) {
      return (
        <div className="min-h-screen bg-[#000F46] flex items-center justify-center">
          <div className="bg-yellow-900/80 text-white text-center p-8 rounded-xl border border-yellow-500 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Trading Data Not Found</h2>
            <p className="text-yellow-200">Your trading profile has not been configured yet.</p>
          </div>
        </div>
      );
    }

    // 2. Calculate Stats
    const rawItemAmount = tradingData.rawUserAmounts?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const craftItemAmount = tradingData.craftUserAmounts?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    const formatBigInt = (val: bigint | number) => {
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const stats = {
      usd: formatBigInt(tradingData.usd ?? 0),
      idr: formatBigInt(tradingData.idr ?? 0),
      eternites: formatBigInt(tradingData.eternites ?? 0),
      mapAmount: Number(tradingData.map || 0),
      rawItemAmount,
      craftItemAmount
    };

    // 3. Get Active Period
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
        <div className="absolute bg-gradient-to-b from-transparent via-[#AE00DE]/0 to-[#23328C] w-full h-full top-0 left-0 pointer-events-none"></div>
        
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
              periodNumber={activePeriod?.periode}
              initialStatus={activePeriod?.status || null}
              stats={stats}
              news={activePeriod?.news}
            />
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error("Trading page error:", error);
    return (
      <div className="min-h-screen bg-[#000F46] flex items-center justify-center">
        <div className="bg-red-900/80 text-white text-center p-8 rounded-xl border border-red-500 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Unexpected Error</h2>
          <p className="text-red-200">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }
}
