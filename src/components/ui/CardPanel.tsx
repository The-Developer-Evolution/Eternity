import React from 'react'
import Timer from '@/components/common/Timer'
export default function CardPanel({ title = "title", period = "period", children }: { title: string, period: string, children: React.ReactNode }) {
  return (
    <section className='p-12 rounded-lg bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-center items-center gap-8'>
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <h1 className='text-center text-4xl md:text-5xl font-impact'>{title}</h1>
        <h3 className='text-center w-full text-[#41FFA3] font-futura text-2xl md:text-2xl'>{period}</h3>
      </div>
      <Timer></Timer>
      {children}
    </section>
  )
}
