import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getMyInventory } from "@/features/rally/services/item";
import { getServerSession } from "next-auth";
import CardPanel from "@/components/ui/CardPanel";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession();
  const inventory = await getMyInventory(session?.user?.id!);

  const bigItemsNormalized = inventory.big_items
    .filter((item) => item.amount >= 1)
    .map((item) => ({
      id: item.id,
      amount: item.amount,
      name: item.bigItem.name,
      isBig: true,
    }));

  const smallItemsNormalized = inventory.small_items
    .filter((item) => item.amount >= 1)
    .map((item) => ({
      id: item.id,
      amount: item.amount,
      name: item.smallItem.name,
      isBig: false,
    }));

  const allItems = [...bigItemsNormalized, ...smallItemsNormalized];

  const itemsPerPage = 8;
  const currentPage = Number(searchParams.page) || 1;
  const totalPages = Math.ceil(allItems.length / itemsPerPage) || 1;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedItems = allItems.slice(startIndex, startIndex + itemsPerPage);

  const emptySlotsCount = itemsPerPage - displayedItems.length;
  const emptySlots = Array.from({ length: emptySlotsCount });

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center py-10">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        
        <CardPanel title="RALLY GAMES - INVENTORY" extraClass="">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {displayedItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative p-4 h-32 rounded-xl backdrop-blur-lg border-2 flex flex-col justify-center items-center text-center shadow-lg transition-all ${
                    item.isBig 
                    ? "bg-[#23328C]/60 border-[#78CCEE]" 
                    : "bg-[#3E344A]/60 border-white/40"
                  }`}
                >
                  <div className={`absolute -top-2 -right-2 font-impact px-2 py-0.5 rounded-md text-sm border-2 ${
                    item.isBig ? "bg-[#41FFA3] text-[#3E344A] border-[#23328C]" : "bg-white text-[#3E344A] border-[#3E344A]"
                  }`}>
                    x{item.amount}
                  </div>
                  <h2 className={`text-sm font-impact uppercase leading-tight ${item.isBig ? "text-[#78CCEE]" : "text-white"}`}>
                    {item.name}
                  </h2>
                </div>
              ))}

              {emptySlots.map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="h-32 rounded-xl bg-black/20 border-white/10 border-2 border-dashed flex items-center justify-center"
                >
                  <span className="text-white/10 font-impact text-xs uppercase tracking-widest">Empty Slot</span>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <Link
                  href={`?page=${currentPage - 1}`}
                  className={`px-4 py-2 bg-white/10 text-white rounded-md font-impact ${currentPage === 1 ? 'pointer-events-none opacity-30' : 'hover:bg-white/20'}`}
                >
                  PREV
                </Link>
                <span className="text-white font-impact">
                  PAGE {currentPage} OF {totalPages}
                </span>
                <Link
                  href={`?page=${currentPage + 1}`}
                  className={`px-4 py-2 bg-white/10 text-white rounded-md font-impact ${currentPage === totalPages ? 'pointer-events-none opacity-30' : 'hover:bg-white/20'}`}
                >
                  NEXT
                </Link>
              </div>
            )}
          </div>
        </CardPanel>
      </div>
    </div>
  );
}