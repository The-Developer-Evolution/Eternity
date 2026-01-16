'use client'

import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getPusherClient } from "@/lib/pusher"; 
import { RallyPeriodStatus } from "@/generated/prisma/enums";

interface ContestState {
  status: RallyPeriodStatus | string;
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

export default function ContestTimer() {
  const { data } = useSWR<ContestState>("/api/contest/status", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  
  const { mutate } = useSWRConfig();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe("contest-channel");
    
    const handleStatusUpdate = (updatedContest: ContestState) => {
      mutate("/api/contest/status", updatedContest, false);
    };

    channel.bind("status-update", handleStatusUpdate);

    return () => {
      channel.unbind("status-update", handleStatusUpdate);
      pusher.unsubscribe("contest-channel");
    };
  }, [mutate]);

  useEffect(() => {
    if (!data || !data.endTime || !data.serverTime) return;

    const serverTime = new Date(data.serverTime).getTime();
    const clientTimeNow = Date.now();
    const timeOffset = serverTime - clientTimeNow; 

    const interval = setInterval(() => {
      const nowBasedOnServer = new Date(Date.now() + timeOffset).getTime();
      
      if (data.status === "ON_GOING") {
        const endTime = new Date(data.endTime).getTime();
        
        if (isNaN(endTime)) {
          setTimeLeft(0);
          return;
        }

        const remaining = Math.max(0, Math.round((endTime - nowBasedOnServer) / 1000));
        setTimeLeft(remaining);
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
    if (!data) return "Loading...";
    
    if (timeLeft === 0 && data.status === "ON_GOING") return "Finishing Contest...";

    switch (data.status) {
      case "NOT_STARTED": return "Contest Starting Soon";
      case "PAUSED": return "Contest Paused";
      case "ENDED": return "Contest Finished";
      case "ON_GOING": return null;
      default: return "Standby";
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