import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getMyRallyHistory } from "@/features/rally/services/history";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession();
  const history = await getMyRallyHistory(session?.user?.id!);

  if(!history){
    return <p>No history found.</p>;
  }
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <div className="relative z-10 p-12 rounded-lg bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-center items-center gap-8 font-futura">
          <h1 className="text-4xl font-impact mb-6">Rally Activity Log</h1>
          {history.length === 0 ? (
              <p>No activity found.</p>
            ) : (
              <ul className="space-y-4">
                {history.map((h) => (
                  <li key={h.id} className="p-4 rounded-lg bg-[#23328C]/80 backdrop-blur-lg border-white border-3 flex flex-col justify-center items-center">
                    <p className="font-semibold">{h.message}</p>
                    <p className="text-sm text-white text-opacity-70">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </div>
  );
}
