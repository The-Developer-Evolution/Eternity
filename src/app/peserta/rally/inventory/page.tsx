import Image from "next/image";
import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getMyInventory } from "@/features/rally/services/item";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession();
  const inventory = await getMyInventory(session?.user?.id!);

  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="relative z-10 p-12 rounded-lg bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-center items-center gap-8 font-futura">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Rally Inventory</h1>
          {inventory.big_items.length === 0 && inventory.small_items.length === 0 ? (
            <p>No items in inventory.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {inventory.big_items.map((item) => (
                  <li key={item.id} className="p-4 rounded-lg bg-[#23328C]/80 backdrop-blur-lg border-white border-3 flex flex-col justify-center items-center">
                    <h2 className="text-xl font-semibold text-white">{item.bigItem.name}</h2>
                    <p className="text-white">x{item.amount}</p>
                  </li>
                ))}
              </ul>

              <ul className="space-y-4">
                {inventory.small_items.map((item) => (
                  <li key={item.id} className="p-4 rounded-lg bg-[#23328C]/80 backdrop-blur-lg border-white border-3 flex flex-col justify-center items-center">
                    <h2 className="text-xl font-semibold text-white">{item.smallItem.name}</h2>
                    <p className="text-white">x{item.amount}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
