import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getAllPos } from "@/features/rally/services/pos";

export default async function Page() {
  const pos = await getAllPos();
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="relative z-10 w-full max-w-[80%] bg-opacity-20 rounded-lg space-y-4 my-[20%] sm:my-[10%]">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Rally Pos</h1>
          {pos.map((p) => (
            <div key={p.id} className="p-4 rounded-lg bg-[#23328C]/80 backdrop-blur-lg border-white border-3 flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold text-white">{p.name}</h2>
              <p className="text-white">Location: {p.rally_zone.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
