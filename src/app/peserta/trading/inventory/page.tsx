import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserTradingById } from "@/features/user/trading.service";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userRes = await getUserTradingById(session.user.id);

  if (!userRes.success || !userRes.data || !userRes.data.tradingData) {
     return (
        <div className="min-h-screen bg-[#000F46] flex items-center justify-center">
          <div className="bg-red-900/80 text-white text-center p-8 rounded-xl border border-red-500 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Error Loading Inventory</h2>
            <p className="text-red-200">{userRes.error || "Inventory Not Found"}</p>
             <Link href="/peserta/trading" className="inline-block mt-4 text-blue-300 hover:underline">
                    Back to Trading Dashboard
              </Link>
          </div>
        </div>
      );
  }

  const tradingData = userRes.data.tradingData;
  const rawItems = tradingData.rawUserAmounts || [];
  const craftItems = tradingData.craftUserAmounts || [];
  const mapCount = tradingData.map || 0;

  return (
    <div className="overflow-hidden min-h-screen relative text-white">
      <BackgroundAssetsDesktop />
      <BackgroundAssetsMobile />
      <div className="absolute bg-gradient-to-b from-transparent via-[#AE00DE]/0 to-[#23328C] w-full h-full top-0 left-0 pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 pt-20 py-8 flex flex-col gap-8">
        
        <div className="bg-blue-950/50 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-xl flex flex-col gap-8 shadow-xl">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-md text-center md:text-left">
                My Inventory
            </h1>
            
            {/* Forbidden Map Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <span>🗺️</span> Forbidden Map
                </h2>
                 <div className="flex items-start">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 min-w-[150px]">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-3xl">
                            🗺️
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-white/60 font-medium">Map</div>
                            <div className="text-2xl font-bold text-white">{Number(mapCount)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/10 w-full"></div>

             {/* Raw Items Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <span>🪵</span> Raw Materials
                </h2>
                
                {rawItems.length === 0 ? (
                    <div className="text-white/40 text-center py-8 italic bg-black/20 rounded-xl">No raw materials owned.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {rawItems.map((item) => (
                             <div key={item.id} className="bg-black/20 hover:bg-black/30 transition-colors border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 text-center group">
                                <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1" title={item.rawItem.name}>
                                    {item.rawItem.name}
                                </div>
                                <div className="text-xl font-bold text-green-400">
                                    {Number(item.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-px bg-white/10 w-full"></div>

            {/* Craft Items Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                     <span>⚒️</span> Crafted Items
                </h2>

                 {craftItems.length === 0 ? (
                    <div className="text-white/40 text-center py-8 italic bg-black/20 rounded-xl">No crafted items owned.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {craftItems.map((item) => (
                             <div key={item.id} className="bg-black/20 hover:bg-black/30 transition-colors border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 text-center group">
                                <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1" title={item.craftItem.name}>
                                    {item.craftItem.name}
                                </div>
                                <div className="text-xl font-bold text-purple-400">
                                    {Number(item.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
