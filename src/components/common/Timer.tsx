'use client'

import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
// Pastikan path ini sesuai dengan struktur project Anda
import { pusherClient } from "@/lib/pusher"; 
// Jika Enum ini tidak ditemukan, bisa diganti string biasa atau dihapus typenya sementara
import { RallyPeriodStatus } from "@/generated/prisma/enums";

interface ContestState {
  status: RallyPeriodStatus | string; // Fallback string jika enum bermasalah
  startTime: string;
  endTime: string;
  serverTime: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TimerBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl font-bold tracking-widest">{value}</span>
    <span className="text-xs text-gray-400">{label}</span>
  </div>
);

// PERBAIKAN 1: Gunakan 'export default' agar import di CardPanel tidak error
export default function ContestTimer() {
  const { data, error } = useSWR<ContestState>("/api/contest/status", fetcher);
  const { mutate } = useSWRConfig();
  const [timeLeft, setTimeLeft] = useState(0);

  // PERBAIKAN 2: Gunakan pusherClient singleton (konsisten dengan file Leaderboard)
  useEffect(() => {
    // Subscribe
    const channel = pusherClient.subscribe("contest-channel");
    
    const handleStatusUpdate = (updatedContest: ContestState) => {
      console.log("Timer update received:", updatedContest);
      mutate("/api/contest/status", updatedContest, false);
    };

    channel.bind("status-update", handleStatusUpdate);

    return () => {
      channel.unbind("status-update", handleStatusUpdate);
      pusherClient.unsubscribe("contest-channel");
    };
  }, [mutate]);

  useEffect(() => {
    if (!data || !data.endTime || !data.serverTime) {
      return;
    }

    const serverTime = new Date(data.serverTime).getTime();
    if (isNaN(serverTime)) return;

    const clientTime = Date.now();
    const timeOffset = serverTime - clientTime;

    const interval = setInterval(() => {
      if (data.status === "ON_GOING") {
        const endTime = new Date(data.endTime).getTime();

        if (isNaN(endTime)) {
          setTimeLeft(0);
          return;
        }

        const now = new Date(Date.now() + timeOffset);
        const remaining = Math.round((endTime - now.getTime()) / 1000);
        setTimeLeft(Math.max(0, remaining));
      } else if (data.status === "PAUSED") {
        // Do nothing / keep state
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const h = Math.floor(timeLeft / 3600).toString().padStart(2, "0");
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(timeLeft % 60).toString().padStart(2, "0");

  const getStatusMessage = () => {
    if (error) return "Error Loading Timer";
    if (!data) return "Loading...";
    
    switch (data.status) {
      case "NOT_STARTED": // Asumsi ada status ini
        return "Contest Starting Soon";
      case "ON_GOING":
        return null; // PERBAIKAN 3: Return null agar TimerBox dirender!
      case "PAUSED":
        return "Contest Paused";
      case "ENDED":
        return "Contest Finished";
      default:
        // Jika status on_going tapi masuk default, pastikan return null
        return data.status === "ON_GOING" ? null : "Standby";
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-sm text-white font-mono py-4 px-6 rounded-lg shadow-lg border border-purple-500/50 flex justify-center items-center mb-8">
      {statusMessage ? (
        <span className="text-xl font-bold text-center animate-pulse">
          {statusMessage}
        </span>
      ) : (
        <div className="flex items-center gap-3">
          <TimerBox value={h} label="HRS" />
          <span className="text-2xl pb-4">:</span>
          <TimerBox value={m} label="MIN" />
          <span className="text-2xl pb-4">:</span>
          <TimerBox value={s} label="SEC" />
        </div>
      )}
    </div>
  );
}