import React from 'react'
import Link from 'next/link'
export default function NavigationBar() {
  return (
    <nav className='fixed w-screen overflow-hidden px-[5%] z-100 h-[7vh] bg-[#04043A] flex justify-between items-center text-4xl font-bold'>
        <Link href={"/"}>E</Link>
        <div className='flex bg-[#78CCEE] p-3 rounded-lg flex-col gap-1'>
            <div className='bg-black h-1 w-6'></div>
            <div className='bg-black h-1 w-6'></div>
            <div className='bg-black h-1 w-6'></div>
        </div>
    </nav>
  )
}
