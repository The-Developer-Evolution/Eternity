"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { RallyPeriodStatus } from "@/generated/prisma/enums";
import { pusherClient } from "@/lib/pusher";
import Link from "next/link";
// import { formatCurrency } from "@/utils/format"; // Removed unused import

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
}

export function PlayerTradingDashboard({ periodId, initialStatus, stats }: PlayerTradingDashboardProps) {

  const { data: tradingData, mutate } = useSWR<TradingStatusResponse>(
    periodId ? `/api/trading/status?periodId=${periodId}` : null,
    fetcher,
    {
      fallbackData: initialStatus ? { status: initialStatus } : undefined
    }
  );

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
    const channel = pusherClient.subscribe("trading-channel");
    channel.bind("status-update", () => {
      mutate();
    });
    return () => {
      pusherClient.unsubscribe("trading-channel");
    };
  }, [mutate]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4">
      {/* Timer Section */}
      <div className="bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-[#684095] shadow-2xl text-center">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Trading Status</p>
        <p className={`text-4xl font-impact tracking-wide ${
          status === "ON_GOING" ? "text-green-400" : 
          status === "PAUSED" ? "text-yellow-400" : 
          status === "ENDED" ? "text-red-400" : "text-white"
        }`}>
            {status ? status.replace(/_/g, " ") : "WAITING..."}
        </p>
        
        {(status === "ON_GOING" || status === "PAUSED") && (
             <div className="mt-2 text-6xl font-mono text-white font-bold tabular-nums tracking-widest text-shadow-glow">
                {formatTime(timeLeft)}
             </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Currencies */}
        <div className="bg-blue-900/40 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-blue-200 border-b border-blue-500/30 pb-2">Wallet</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-blue-300">USD</p>
                    <p className="text-2xl font-bold text-white">${stats.usd}</p>
                </div>
                <div>
                    <p className="text-xs text-blue-300">IDR</p>
                    <p className="text-2xl font-bold text-white">Rp {stats.idr}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs text-blue-300">Eternities</p>
                    <p className="text-2xl font-bold text-[#AE00DE]">{stats.eternites}</p>
                </div>
            </div>
        </div>

        {/* Inventory Counts */}
        <div className="bg-purple-900/40 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-purple-200 border-b border-purple-500/30 pb-2">Inventory Stats</h3>
             <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-purple-300">Raw Items</p>
                    <p className="text-2xl font-bold text-white">{stats.rawItemAmount}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-purple-300">Craft Items</p>
                    <p className="text-2xl font-bold text-white">{stats.craftItemAmount}</p>
                </div>
                 <div className="bg-black/30 p-2 rounded">
                    <p className="text-xs text-purple-300">Maps</p>
                    <p className="text-2xl font-bold text-white">{stats.mapAmount}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
            href="/peserta/trading/inventory"
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-xl text-center shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-[1.02]"
        >
            <span className="relative z-10 font-bold text-white text-xl tracking-wider">📦 INVENTORY</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </Link>

        <Link 
            href="/peserta/trading/leaderboard"
             className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl text-center shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
             <span className="relative z-10 font-bold text-white text-xl tracking-wider">🏆 LEADERBOARD</span>
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </Link>
      </div>
    </div>
  );
}
