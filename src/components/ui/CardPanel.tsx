'use client'

import React, { useEffect } from 'react'
import Timer from '@/components/common/Timer'
import useSWR from 'swr'
import { getPusherClient } from '@/lib/pusher'

interface PeriodData {
  periodName: string;
  periodId: string | null;
  status: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CardPanel({ 
  title = "title", 
  children, 
  extraClass = "",
  showTimer = true 
}: { 
  title: string, 
  children: React.ReactNode, 
  extraClass?: string 
  showTimer?: boolean
}) {
  const { data: periodData, mutate } = useSWR<PeriodData>(
    '/api/rally/period',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 5 seconds as fallback
      revalidateOnFocus: true,
    }
  );

  // Derive period directly from data instead of using setState in effect
  const period = periodData?.periodName ?? "Loading...";

  // Subscribe to Pusher for real-time updates
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe("contest-channel");
    
    const handleStatusUpdate = () => {
      // Revalidate period data when contest status changes
      mutate();
    };

    channel.bind("status-update", handleStatusUpdate);

    return () => {
      channel.unbind("status-update", handleStatusUpdate);
      pusher.unsubscribe("contest-channel");
    };
  }, [mutate]);

  return (
    <section className={`relative z-10 p-4 md:p-12 box-border rounded-lg w-full max-h-160 overflow-y-auto overflow-x-hidden max-w-[80vw] bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-start items-center gap-8 ${extraClass}`}>
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <h1 className='text-center text-4xl md:text-5xl font-impact text-white'>{title}</h1>
        <h3 className='text-center w-full text-[#41FFA3] font-futura text-2xl md:text-2xl'>
          {period}
        </h3>
      </div>
      {showTimer && <Timer />}
      {children}
    </section>
  )
}
