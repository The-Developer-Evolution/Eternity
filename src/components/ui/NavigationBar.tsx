"use client";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { checkUserRole } from "@/features/auth/utils";
import { AdminRally, AdminRallyRole } from "@/generated/prisma/client";
import { AdminTradingRole } from "@/generated/prisma/client";
import { getUserRoles, UserRoles } from "@/features/auth/service";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const [roles, setRoles] = useState<UserRoles | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const ActionButton = ({ onClick, children, variant = 'primary' }: { onClick: () => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger' | 'debug' }) => {
        const baseStyle = "w-full py-3 px-4 rounded-xl font-semibold transition-all transform active:scale-95 text-sm shadow-lg backdrop-blur-sm mb-2";
        const variants = {
            primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20",
            secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
            danger: "bg-red-900/10 hover:bg-red-900/30 text-red-200 border border-red-900/30",
            debug: "bg-amber-900/10 hover:bg-amber-900/20 text-amber-500 border border-dashed border-amber-900/30"
        };
        return (
            <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
                {children}
            </button>
        );
    };

  useEffect(() => {
    if (!session?.user.id) return;
    async function fetchRoles() {
      const result = await getUserRoles(session!.user.id);
      setRoles(result);
    }
    fetchRoles();
  }, [session?.user.id]);

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
          {session?.user && roles ? (
            <Link
              href="/admin"
              className="text-black hover:text-black hover:bg-[#5db4d6] transition-colors text-xl  bg-[#78CCEE] p-2 rounded-lg"
            >
              Login
            </Link>
          ) : (
            <ActionButton variant="danger" onClick={() => signOut()}>
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
            {session?.user && roles && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">
                  Authentication
                </h3>
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="text-white hover:text-[#78CCEE] transition-colors text-xl"
                >
                  Login
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <h3 className="text-[#78CCEE] text-2xl uppercase tracking-widest border-b border-[#78CCEE]/30 pb-2">
                Admin
              </h3>
              <Link
                href="/admin"
                onClick={closeMenu}
                className="text-white hover:text-[#78CCEE] transition-colors text-xl"
              >
                Dashboard
              </Link>
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
              <Link
                href="/admin/talkshow"
                onClick={closeMenu}
                className="text-white hover:text-[#78CCEE] transition-colors text-xl"
              >
                Rally
              </Link>
            </div>

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
          </div>
        </div>
      </nav>
    </>
  );
}
