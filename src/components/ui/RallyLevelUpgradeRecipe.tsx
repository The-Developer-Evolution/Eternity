import React from 'react'

export default function RallyLevelUpgradeRecipe({levelWhatToWhat = "1 -> 2", children}: {levelWhatToWhat: string, children: React.ReactNode}) {
  return (
    <div className='w-full flex flex-col gap-4 text-white bg-black/30 p-4 border-white border-3 rounded-lg'>
      <h1 className='text-lg md:text-3xl font-impact'>{levelWhatToWhat}</h1>
      <ul className='text-,d md:text-xl font-semibold'>
        {children}
      </ul>
    </div>
  )
}
