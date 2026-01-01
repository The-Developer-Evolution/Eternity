import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getMyRallyHistory } from "@/features/rally/services/history";
import CardPanel from "@/components/ui/CardPanel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
   const session = await getServerSession(authOptions);
  if(!session || !session.user?.id){
    return
  }
  const history = await getMyRallyHistory(session.user.id);

  if(!history){
    return <p>No history found.</p>;
  }
  return (
    <div className="overflow-hidden">
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center">
        <BackgroundAssetsDesktop></BackgroundAssetsDesktop>
        <BackgroundAssetsMobile></BackgroundAssetsMobile>
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <CardPanel title="RALLY GAMES - LOGS" extraClass="">
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
        </CardPanel>
      </div>
    </div>
  );
}
