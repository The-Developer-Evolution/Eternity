import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getAllPos } from "@/features/rally/services/pos";
import CardPanel from "@/components/ui/CardPanel";

export default async function Page() {
  const pos = await getAllPos();
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center py-12">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <CardPanel title="RALLY GAMES - POS" extraClass="">
          {pos.length > 0 ? (
            pos.map((p) => (
              <div key={p.id} className="p-4 w-full rounded-lg bg-black/50 backdrop-blur-lg border-white border-3 flex flex-col justify-center items-center">
                <h2 className="text-xl font-semibold text-white">{p.name}</h2>
                <p className="text-white">Location: {p.rally_zone.name}</p>
              </div>
            ))
          ) : (
            <p className="text-white">No Pos available.</p>
          )}
        </CardPanel>
      </div>
    </div>
  );
}
