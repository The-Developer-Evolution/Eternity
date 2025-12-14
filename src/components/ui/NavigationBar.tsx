"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <nav className='fixed w-screen overflow-hidden px-[5%] z-50 h-[7vh] bg-[#04043A] flex justify-between items-center text-4xl font-bold'>
        <Link href={"/"} onClick={closeMenu} className="text-[#78CCEE] z-50 relative">E</Link>
        
        {/* Hamburger Button */}
        <button 
          onClick={toggleMenu} 
          className='flex bg-[#78CCEE] p-3 rounded-lg flex-col gap-1 z-50 relative hover:bg-[#5db4d6] transition-colors'
          aria-label="Toggle menu"
        >
          <div className={`bg-black h-1 w-6 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`bg-black h-1 w-6 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
          <div className={`bg-black h-1 w-6 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
        </button>

        {/* Menu Overlay */}
        <div className={`fixed inset-0 bg-[#04043A]/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col gap-8 text-center">
            <div className="flex flex-col gap-4">
              <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">Authentication</h3>
              <Link href="/admin" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Login</Link>
            </div>


            <div className="flex flex-col gap-4">
              <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">Admin</h3>
              <Link href="/admin" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Dashboard</Link>
              <Link href="/admin/trading" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Talkshow</Link>
              <Link href="/admin/trading" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Trading</Link>
              <Link href="/admin/talkshow" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Pressure</Link>
              <Link href="/admin/talkshow" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Rally</Link>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">Peserta</h3>
              <Link href="/peserta/rally" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Rally</Link>
              <Link href="/peserta/trading" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Trading</Link>
              <Link href="/peserta/talkshow" onClick={closeMenu} className="text-white hover:text-[#78CCEE] transition-colors text-xl">Talkshow</Link>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}
