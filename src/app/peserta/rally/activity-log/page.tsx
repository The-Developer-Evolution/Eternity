import BackgroundAssetsDesktop from "@/components/common/BackgroundAssetsDesktop";
import BackgroundAssetsMobile from "@/components/common/BackgroundAssetsMobile";
import { getMyRallyHistory } from "@/features/rally/services/history";
import CardPanel from "@/components/ui/CardPanel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function untuk calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

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
      <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center py-10">
        <BackgroundAssetsDesktop />
        <BackgroundAssetsMobile />
        <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
        <CardPanel title="RALLY GAMES - LOGS" extraClass="">
          {history.length === 0 ? (
            <p className="text-white text-center">No activity found.</p>
          ) : (
            <ul className="space-y-4 w-full">
              {history.map((h, idx) => (
                <li
                  key={h.id}
                  className="relative pl-6 w-full"
                >
                  {/* Timeline dot */}
                  <span className="absolute left-0 top-4 w-3 h-3 bg-[#78CCEE] rounded-full border-2 border-white"></span>
                  {/* Timeline line */}
                  {idx !== history.length - 1 && (
                    <span className="absolute left-[6px] top-7 w-0.5 h-[calc(100%-1.5rem)] bg-[#78CCEE]/30"></span>
                  )}
                  <div className="p-4 rounded-lg bg-[#23328C]/80 backdrop-blur-lg border-white border-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold whitespace-pre-line uppercase text-white">{h.message}</span>
                      <span className="text-xs text-[#78CCEE] font-bold ml-2">{getTimeAgo(new Date(h.createdAt))}</span>
                    </div>
                    <span className="text-xs text-white text-opacity-60 mt-1">
                      {new Date(h.createdAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardPanel>
      </div>
    </div>
  );
}
