'use client'

import React, { useEffect, useState } from 'react'
import Timer from '@/components/common/Timer'
import useSWR from 'swr'
import { pusherClient } from '@/lib/pusher'

interface PeriodData {
  periodName: string;
  periodId: string | null;
  status: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CardPanel({ 
  title = "title", 
  children, 
  extraClass = "" 
}: { 
  title: string, 
  children: React.ReactNode, 
  extraClass?: string 
}) {
  const { data: periodData, mutate } = useSWR<PeriodData>(
    '/api/rally/period',
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds as fallback
      revalidateOnFocus: true,
    }
  );

  const [period, setPeriod] = useState<string>("Loading...");

  useEffect(() => {
    if (periodData) {
      setPeriod(periodData.periodName);
    }
  }, [periodData]);

  // Subscribe to Pusher for real-time updates
  useEffect(() => {
    const channel = pusherClient.subscribe("contest-channel");
    
    const handleStatusUpdate = () => {
      // Revalidate period data when contest status changes
      mutate();
    };

    channel.bind("status-update", handleStatusUpdate);

    return () => {
      channel.unbind("status-update", handleStatusUpdate);
      pusherClient.unsubscribe("contest-channel");
    };
  }, [mutate]);

  return (
    <section className={`relative z-10 p-4 md:p-12 box-border rounded-lg w-full max-h-160 overflow-y-auto overflow-x-hidden max-w-[80vw] bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-start items-center gap-8 ${extraClass}`}>
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <h1 className='text-center text-4xl md:text-5xl font-impact'>{title}</h1>
        <h3 className='text-center w-full text-[#41FFA3] font-futura text-2xl md:text-2xl'>
          {period}
        </h3>
      </div>
      <Timer />
      {children}
    </section>
  )
}
