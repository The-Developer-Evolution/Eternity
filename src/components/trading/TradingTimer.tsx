"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { RallyPeriodStatus } from "@prisma/client";
import { getPusherClient } from "@/lib/pusher";

interface TradingStatusResponse {
  status: RallyPeriodStatus;
  startTime?: string;
  endTime?: string;
  pausedTime?: string;
  serverTime?: string;
  periodNumber?: number;
}

const formatTime = (seconds: number) => {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TradingTimer() {
  // Fetch without periodId - the API should return the active period's status
  const { data: tradingData, mutate } = useSWR<TradingStatusResponse>(
    "/api/trading/status",
    fetcher,
    {
      refreshInterval: 0, // Disable auto-refresh, rely on Pusher
    }
  );

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentPeriodNumber, setCurrentPeriodNumber] = useState<number | undefined>(undefined);
  
  const status = tradingData?.status ?? RallyPeriodStatus.NOT_STARTED;
  const isRunning = status === "ON_GOING" || status === "PAUSED";

  // Update period number from initial fetch
  useEffect(() => {
    if (tradingData?.periodNumber !== undefined) {
      setCurrentPeriodNumber(tradingData.periodNumber);
    }
  }, [tradingData?.periodNumber]);

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
          console.log("Timer reached 0, triggering status refetch...");
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
       console.warn("TradingTimer: Pusher client not initialized");
       return;
    }

    // Log current state immediately (in case it's already connected)
    console.log("TradingTimer: Current Pusher State:", pusher.connection.state);

    console.log("TradingTimer: Subscribing to trading-channel...");
    
    // Debug connection state
    pusher.connection.bind("state_change", (states: any) => {
        console.log("TradingTimer Pusher Connection State:", states);
    });

    pusher.connection.bind("error", (err: any) => {
        console.error("TradingTimer Pusher Connection Error:", err);
    });

    const channel = pusher.subscribe("trading-channel");

    channel.bind("pusher:subscription_succeeded", () => {
        console.log("TradingTimer: Successfully subscribed to trading-channel");
    });

    channel.bind("status-update", (data: any) => {
        console.log("TradingTimer: Received status-update event:", data);
        
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
    });

    return () => {
      console.log("TradingTimer: Unsubscribing from trading-channel");
      pusher.unsubscribe("trading-channel");
      pusher.connection.unbind("state_change");
      pusher.connection.unbind("error");
    };
  }, [mutate]);

  return (
    <div className="w-full px-5 max-w-lg mx-auto mb-6" suppressHydrationWarning>
      <div className="bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-[#684095] shadow-2xl text-center relative overflow-hidden">
        {/* Period Number Badge */}
        {currentPeriodNumber && isRunning && (
          <div className="absolute top-2 right-2 bg-purple-900/50 border border-purple-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-purple-300 tracking-wider">
             PERIOD #{currentPeriodNumber}
          </div>
        )}

        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Trading Status</p>
        <p className={`text-2xl font-impact tracking-wide ${
          status === "ON_GOING" ? "text-green-400" : 
          status === "PAUSED" ? "text-yellow-400" : 
          status === "ENDED" ? "text-red-400" : "text-white"
        }`} suppressHydrationWarning>
            {status ? status.replace(/_/g, " ") : "WAITING..."}
        </p>
        
        {isRunning && (
             <div className="mt-1 text-4xl font-mono text-white font-bold tabular-nums tracking-widest text-shadow-glow" suppressHydrationWarning>
                {formatTime(timeLeft)}
             </div>
        )}
      </div>
    </div>
  );
}
