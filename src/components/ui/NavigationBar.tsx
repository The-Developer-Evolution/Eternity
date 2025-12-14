"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import ActionButton from "@/components/common/ActionButton";
import { Role } from "@/generated/prisma/enums";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Get user role from session
  const userRole = session?.user?.role as Role | undefined;

  // Check if user has trading admin role
  const isTradingAdmin =
    userRole &&
    [
      Role.BLACKMARKET,
      Role.BUYRAW,
      Role.CRAFT,
      Role.MAP,
      Role.TALKSHOW,
      Role.CURRENCY,
      Role.PITCHING,
      Role.PITCHINGGUARD,
      Role.THUNT,
      Role.SELL,
      Role.PRESSURE,
      Role.SUPER,
    ].includes(userRole);

  // Check if user has rally admin role
  const isRallyAdmin =
    userRole &&
    [
      Role.MONSTER,
      Role.UPGRADE,
      Role.EXCHANGE,
      Role.POSTGUARD,
      Role.SUPER,
    ].includes(userRole);

  return (
    <>
      <nav className="fixed w-screen overflow-hidden px-[5%] z-50 h-[7vh] bg-[#04043A] flex justify-between items-center text-4xl font-bold">
        <Link
          href={"/"}
          onClick={closeMenu}
          className="text-[#78CCEE] z-50 relative"
        >
          E
        </Link>

        {/* Hamburger Button */}
        <div className="flex gap-4 items-center justify-center">
          {!session ? (
            <Link
              href="/login"
              className="text-black hover:text-black hover:bg-[#5db4d6] transition-colors text-xl  bg-[#78CCEE] p-2 rounded-lg"
            >
              Login
            </Link>
          ) : (
            <ActionButton onClick={() => signOut()} variant="danger">
              Logout
            </ActionButton>
          )}
          <button
            onClick={toggleMenu}
            className="flex bg-[#78CCEE] p-3 rounded-lg flex-col gap-1 z-50 relative hover:bg-[#5db4d6] transition-colors"
            aria-label="Toggle menu"
          >
            <div
              className={`bg-black h-1 w-6 transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></div>
            <div
              className={`bg-black h-1 w-6 transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            ></div>
            <div
              className={`bg-black h-1 w-6 transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></div>
          </button>
        </div>

        {/* Menu Overlay */}
        <div
          className={`fixed inset-0 bg-[#04043A]/95 backdrop-blur-sm z-40 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col gap-8 text-center">
            {!session && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">
                  Authentication
                </h3>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Admin Trading Menu - Only show for trading admins */}
            {isTradingAdmin && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">
                  Admin Trading
                </h3>
                <Link
                  href="/admin/trading"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Talkshow
                </Link>
                <Link
                  href="/admin/trading"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Trading
                </Link>
                <Link
                  href="/admin/talkshow"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Pressure
                </Link>
              </div>
            )}

            {/* Admin Rally Menu - Only show for rally admins */}
            {isRallyAdmin && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">
                  Admin Rally
                </h3>
                <Link
                  href="/admin/talkshow"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Minus Point
                </Link>
                <Link
                  href="/admin/talkshow"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Upgrade
                </Link>
                <Link
                  href="/admin/talkshow"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Exchange
                </Link>
                <Link
                  href="/admin/talkshow"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Postguard
                </Link>
              </div>
            )}

            {/* Peserta Menu - Show for all logged in users */}
            {session && (
              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">
                  Peserta
                </h3>
                <Link
                  href="/peserta/rally"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Rally
                </Link>
                <Link
                  href="/peserta/trading"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Trading
                </Link>
                <Link
                  href="/peserta/talkshow"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Talkshow
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
