"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { StartTradingTimer, pauseTrading, resumeTrading, endTrading } from "@/features/trading/services/timer";
import { RallyPeriodStatus } from "@/generated/prisma/enums";
import { pusherClient } from "@/lib/pusher";

interface TradingPeriod {
  id: string;
  periode: number;
  duration: number;
}

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

interface TradingAdminDashboardProps {
  initialContestState: RallyPeriodStatus | null;
  periods: TradingPeriod[];
  activePeriodId: string | null;
}

export function TradingAdminDashboard({ initialContestState, periods, activePeriodId }: TradingAdminDashboardProps) {
  
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    activePeriodId || periods[0]?.id || ""
  );

  const { data: tradingData, mutate } = useSWR<TradingStatusResponse>(
    selectedPeriodId ? `/api/trading/status?periodId=${selectedPeriodId}` : null,
    fetcher,
    {
      fallbackData: initialContestState ? { status: initialContestState } : undefined
    }
  );

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(20);


  const [timeLeft, setTimeLeft] = useState<number>(0);

  const status = tradingData?.status ?? RallyPeriodStatus.NOT_STARTED;

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
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(interval);
    }

  }, [tradingData, status]);

  useEffect(() => {
    const period = periods.find(p => p.id === selectedPeriodId);
    if (period) {
      setDuration(period.duration);
    }
  }, [selectedPeriodId, periods]);

  useEffect(() => {
    const channel = pusherClient.subscribe("trading-channel");
    channel.bind("status-update", () => {
      mutate();
    });
    return () => {
      pusherClient.unsubscribe("trading-channel");
    };
  }, [mutate]);

  const handleAction = async (action: string) => {
    setIsLoading(action);
    setError(null);
    try {
      switch (action) {
        case "start":
          await StartTradingTimer(selectedPeriodId, duration);
          break;
        case "pause":
          await pauseTrading();
          break;
        case "resume":
          await resumeTrading();
          break;
        case "end":
          await endTrading();
          break;
      }
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-[#684095] shadow-2xl mb-8">
      <div className="mb-6 text-center border-b border-gray-700 pb-4">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Trading Status</p>
        <p className={`text-4xl font-impact tracking-wide ${
          status === "ON_GOING" ? "text-green-400" : 
          status === "PAUSED" ? "text-yellow-400" : 
          status === "ENDED" ? "text-red-400" : "text-white"
        }`}>
            {status ? status.replace(/_/g, " ") : "LOADING..."}
        </p>
        
        {(status === "ON_GOING" || status === "PAUSED") && (
             <div className="mt-2 text-6xl font-mono text-white font-bold tabular-nums tracking-widest text-shadow-glow">
                {formatTime(timeLeft)}
             </div>
        )}
      </div>

      {(status === RallyPeriodStatus.NOT_STARTED || status === RallyPeriodStatus.ENDED) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-800/50 p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="text-[#75E8F0] font-bold text-sm">SELECT TRADING PERIOD</label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-gray-700 text-white rounded p-3 border border-gray-600 focus:border-[#75E8F0] outline-none transition-colors"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  Period {p.periode}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#75E8F0] font-bold text-sm">DURATION (MINUTES)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-gray-700 text-white rounded p-3 border border-gray-600 focus:border-[#75E8F0] outline-none text-center"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAction("start")}
          disabled={
            isLoading !== null ||
            (status !== RallyPeriodStatus.NOT_STARTED && status !== RallyPeriodStatus.ENDED)
          }
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed py-4 rounded-lg font-impact tracking-wider text-xl text-white transition-all shadow-lg hover:shadow-green-500/20"
        >
          {status === RallyPeriodStatus.ENDED ? "RESTART SELECTED" : "START TRADING"}
        </button>

        <button
          onClick={() => handleAction("end")}
          disabled={
            isLoading !== null || 
            (status !== RallyPeriodStatus.ON_GOING && status !== RallyPeriodStatus.PAUSED)
          }
          className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed py-4 rounded-lg font-impact tracking-wider text-xl text-white transition-all shadow-lg hover:shadow-red-500/20"
        >
          FORCE END
        </button>

        <button
          onClick={() => handleAction("pause")}
          disabled={isLoading !== null || status !== RallyPeriodStatus.ON_GOING}
          className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-white transition-all"
        >
          PAUSE
        </button>

        <button
          onClick={() => handleAction("resume")}
          disabled={isLoading !== null || status !== RallyPeriodStatus.PAUSED}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-white transition-all"
        >
          RESUME
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-center text-sm animate-pulse">
            ⚠️ {error}
        </div>
      )}
    </div>
  );
}
