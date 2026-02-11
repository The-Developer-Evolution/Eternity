"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { RallyPeriodStatus } from "@prisma/client";
import { getPusherClient } from "@/lib/pusher";
import LinkButton from "@/components/common/LinkButton";
import { FaBox, FaChartBar } from "react-icons/fa";

interface TradingStatusResponse {
  status: RallyPeriodStatus;
  startTime?: string;
  endTime?: string;
  pausedTime?: string;
  serverTime?: string;
}

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PlayerTradingDashboardProps {
  periodId: string | null;
  initialStatus: RallyPeriodStatus | null;
  stats: {
    usd: string;
    idr: string;
    eternites: string;
    rawItemAmount: number;
    craftItemAmount: number;
    mapAmount: number;
  };
  news?: string;
  periodNumber?: number;
}

export function PlayerTradingDashboard({ periodId, initialStatus, stats, news, periodNumber }: PlayerTradingDashboardProps) {

  const { data: tradingData, mutate } = useSWR<TradingStatusResponse>(
    periodId ? `/api/trading/status?periodId=${periodId}` : null,
    fetcher,
    {
      fallbackData: initialStatus ? { status: initialStatus } : undefined
    }
  );

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentPeriodNumber, setCurrentPeriodNumber] = useState<number | undefined>(periodNumber);
  const [currentNews, setCurrentNews] = useState<string | undefined>(news);
  
  const status = tradingData?.status ?? RallyPeriodStatus.NOT_STARTED;
  const isRunning = status === "ON_GOING" || status === "PAUSED";

  // Sync timer with server data
  useEffect(() => {
    if (!tradingData) return;

    // Calculate offset ONCE when data updates
    let timeOffset = 0;
    if (tradingData.serverTime) {
      const serverNow = new Date(tradingData.serverTime).getTime();
      const clientNow = Date.now();
      timeOffset = serverNow - clientNow;
    }

    const calculateTimeLeft = () => {
      if (status === "ENDED" || status === "NOT_STARTED") {
        return 0;
      }
      
      if (status === "PAUSED") {
        if (tradingData.endTime && tradingData.pausedTime) {
           const end = new Date(tradingData.endTime).getTime();
           const paused = new Date(tradingData.pausedTime).getTime();
           return Math.max(0, Math.floor((end - paused) / 1000));
        }
        return timeLeft; // Keep current if data missing
      }

      if (status === "ON_GOING" && tradingData.endTime) {
        const end = new Date(tradingData.endTime).getTime();
        // Use the fixed offset to calculate current server time
        const now = Date.now() + timeOffset;
        return Math.max(0, Math.floor((end - now) / 1000));
      }

      return 0;
    };

    setTimeLeft(calculateTimeLeft());

    // Only set interval if running
    if (status === "ON_GOING") {
      const interval = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        
        // When timer reaches 0, trigger a refetch to check/update status
        if (newTimeLeft <= 0) {
          console.log("PlayerDashboard: Timer reached 0, triggering status refetch...");
          mutate(); // This will refetch from server, which auto-ends trading
        }
      }, 1000);
      return () => clearInterval(interval);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradingData, status]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) {
       console.warn("Pusher client not initialized in PlayerDashboard");
       return;
    }

    // Log current state immediately (in case it's already connected)
    console.log("PlayerDashboard: Current Pusher State:", pusher.connection.state);

    console.log("PlayerDashboard: Subscribing to trading-channel...");
    
    // Debug connection state
    pusher.connection.bind("state_change", (states: any) => {
        console.log("PlayerDashboard Pusher Connection State:", states);
    });

    pusher.connection.bind("error", (err: any) => {
        console.error("PlayerDashboard Pusher Connection Error:", err);
    });

    const channel = pusher.subscribe("trading-channel");

    channel.bind("pusher:subscription_succeeded", () => {
        console.log("PlayerDashboard: Successfully subscribed to trading-channel");
    });

    channel.bind("status-update", (data: any) => {
        console.log("PlayerDashboard: Received status-update event:", data);
        
        // Optimistic update - trust the Pusher event data completely
        mutate((currentData) => {
            if (!currentData) return currentData;
            return {
                ...currentData,
                status: data.status,
                startTime: data.startTime ?? currentData.startTime,
                endTime: data.endTime ?? currentData.endTime,
                serverTime: new Date().toISOString(),
            };
        }, { revalidate: false });
        
        // Update period number if provided in the event
        if (data.periodNumber !== undefined) {
            setCurrentPeriodNumber(data.periodNumber);
        }
        
        // Update news if provided in the event
        if (data.news !== undefined) {
            setCurrentNews(data.news);
        }
    });

    return () => {
      console.log("PlayerDashboard: Unsubscribing from trading-channel");
      pusher.unsubscribe("trading-channel");
      pusher.connection.unbind("state_change");
      pusher.connection.unbind("error");
    };
  }, [mutate]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4" suppressHydrationWarning>
      {/* Timer Section */}
      <div className="bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-[#684095] shadow-2xl text-center relative overflow-hidden">
        {/* Period Number Badge */}
        {currentPeriodNumber && isRunning && (
          <div className="relative mx-auto mb-4 w-fit bg-purple-900/50 border border-purple-500/30 px-4 py-2 rounded-full text-xl font-bold text-purple-300 tracking-wider">
             PERIOD #{currentPeriodNumber}
          </div>
        )}

        <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Trading Status</p>
        <p className={`text-4xl font-impact tracking-wide ${
          status === "ON_GOING" ? "text-green-400" : 
          status === "PAUSED" ? "text-yellow-400" : 
          status === "ENDED" ? "text-red-400" : "text-white"
        }`} suppressHydrationWarning>
            {status ? status.replace(/_/g, " ") : "WAITING..."}
        </p>
        
        {isRunning && (
             <div className="mt-2 text-6xl font-mono text-white font-bold tabular-nums tracking-widest text-shadow-glow" suppressHydrationWarning>
                {formatTime(timeLeft)}
             </div>
        )}

        {/* NEWS DISPLAY - Only when running */}
        {currentNews && isRunning && (
          <div className="mt-4 bg-blue-900/40 border border-blue-500/30 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">NEWS INFO</p>
            <p className="text-white font-medium italic">&quot;{currentNews}&quot;</p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Currencies */}
        <div className="bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 p-6 rounded-xl flex flex-col gap-4">
            <h3 className="text-xl font-bold text-blue-200 border-b border-blue-500/30 pb-2">Wallet</h3>
            <div className="flex flex-col flex-wrap gap-4">
                <div>
                    <p className="text-xs text-blue-300">USD</p>
                    <p className="text-2xl font-bold text-white" suppressHydrationWarning>${stats.usd}</p>
                </div>
                <div>
                    <p className="text-xs text-blue-300">IDR</p>
                    <p className="text-2xl font-bold text-white" suppressHydrationWarning>Rp {stats.idr}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs text-blue-300">Eternities</p>
                    <p className="text-2xl font-bold text-white" suppressHydrationWarning>{stats.eternites}</p>
                </div>
            </div>
        </div>

        {/* Inventory Counts */}
        <div className="bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 p-6 rounded-xl flex flex-col gap-4">
            <h3 className="text-xl font-bold text-purple-200 border-b border-purple-500/30 pb-2">Inventory Stats</h3>
             <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-purple-300">Raw Items</p>
                    <p className="text-2xl font-bold text-white" suppressHydrationWarning>{stats.rawItemAmount}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-purple-300">Craft Items</p>
                    <p className="text-2xl font-bold text-white" suppressHydrationWarning>{stats.craftItemAmount}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-purple-300">Maps</p>
                    <p className="text-2xl font-bold text-white" suppressHydrationWarning>{stats.mapAmount}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 w-full">
        <LinkButton 
            link="/peserta/trading/inventory"
            text="INVENTORY"
            icon={<FaBox />}
        />
        <LinkButton 
            link="/peserta/trading/leaderboard"
            text="LEADERBOARD"
            icon={<FaChartBar />}
        />
      </div>
    </div>
  );
}
