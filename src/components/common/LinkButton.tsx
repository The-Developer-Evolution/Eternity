import Link from 'next/link'
import React from 'react'

export default function LinkButton({link = "#", icon, text = "Link Button"} : {link: string, text: string, icon?: React.ReactNode}) {
  return (
    <Link href={link} className='w-full justify-start border-[#3E344A] border-3 rounded-lg px-4 py-2 text-lg md:text-2xl bg-[#78CCEE] text-[#3E344A] font-impact flex items-center gap-4 hover:bg-[#5AA8D6]'>{icon}{text}</Link>
  )
}
