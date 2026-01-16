"use client";

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  totalPoints: number;
  talkshowPoints: number;
  rallyData?: {
    minus_point: number;
    point: number;
  };
  tradingData?: {
    point: number;
  };
}

interface TalkshowAdminPanelProps {
  users: User[];
  onUpdatePoints: (userId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
}

export default function TalkshowAdminPanel({ users, onUpdatePoints }: TalkshowAdminPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- STATE BARU UNTUK COOLDOWN ---
  const [cooldown, setCooldown] = useState(0); 

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

  // --- LOGIKA TIMER MUNDUR ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowDropdown(true);
    if (query.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(allUsers.filter((u) => u.name.toLowerCase().includes(query.toLowerCase())));
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery("");
    setShowDropdown(false);
    setMessage(null);
    setCooldown(0); // Reset cooldown saat ganti user (opsional)
  };

  const updateLocalState = (userId: string, addedAmount: number) => {
    const updater = (prevUsers: User[]) => prevUsers.map(u => {
        if (u.id === userId) {
            return { ...u, talkshowPoints: u.talkshowPoints + addedAmount };
        }
        return u;
    });

    setAllUsers(updater);
    setFilteredUsers(updater);
    setSelectedUser(prev => prev && prev.id === userId ? { ...prev, talkshowPoints: prev.talkshowPoints + addedAmount } : prev);
  };

  const processTransaction = async (isAddition: boolean) => {
    if (!selectedUser) return;
    
    // Cegah klik jika sedang loading atau sedang cooldown
    if (isLoading || cooldown > 0) return;

    setIsLoading(true);
    setMessage(null);

    const finalAmount = isAddition ? pointAmount : -pointAmount;

    try {
      const result = await onUpdatePoints(selectedUser.id, finalAmount);
      
      if (result.success) {
        updateLocalState(selectedUser.id, finalAmount);
        setMessage({ text: isAddition ? "Points Added!" : "Points Deducted!", type: 'success' });
        toast.success(isAddition ? "Points Added Successfully!" : "Points Deducted Successfully!");
        
        setCooldown(5); 

      } else {
        setMessage({ text: result.error || "Transaction Failed", type: 'error' });
        toast.error(result.error || "Transaction Failed");
      }
    } catch {
      setMessage({ text: "Network Error", type: 'error' });
      toast.error("Network Error"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`relative my-[10%] z-10 p-6 md:p-12 box-border rounded-lg w-full max-w-[80vw] bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-start items-center gap-8 min-h-[600px]`}>
      
      <div className='w-full flex flex-col justify-center items-center mb-4'>
        <h1 className='text-center text-4xl md:text-5xl font-impact text-white drop-shadow-lg tracking-wider'>
          ADMIN TALKSHOW
        </h1>
        <p className="text-[#78CCEE] text-sm font-bold uppercase tracking-widest mt-2">Point Management System</p>
      </div>

      <div className="relative w-full max-w-2xl" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Participant Name..."
            className="w-full bg-black/50 text-white px-6 py-4 rounded-xl border-2 border-[#78CCEE]/50 focus:border-[#78CCEE] outline-none transition-all placeholder:text-slate-400 font-bold text-lg shadow-[0_0_15px_rgba(120,204,238,0.2)]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78CCEE]">
             🔍
          </div>
        </div>

        {showDropdown && (
          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-[#0a0a20] border-2 border-[#78CCEE] rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] scrollbar-thin scrollbar-thumb-[#78CCEE] scrollbar-track-transparent">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="p-4 border-b border-white/10 hover:bg-[#1a1a40] cursor-pointer flex justify-between items-center transition-all group"
                >
                  <div>
                    <p className="text-white font-bold text-lg group-hover:text-[#78CCEE] transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/5 group-hover:border-[#78CCEE]/50">
                    <span className="text-[#41FFA3] font-impact text-lg">{user.talkshowPoints} PTS</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-slate-400 text-center font-bold italic">No participants found</div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl flex-1">
        {!selectedUser ? (
          <div className="h-full flex flex-col items-center justify-center bg-black/20 border-2 border-dashed border-[#78CCEE]/30 rounded-2xl p-12">
            <div className="text-6xl mb-4 opacity-50">👆</div>
            <p className="text-white text-xl font-bold uppercase tracking-widest opacity-70">Select a participant to manage points</p>
          </div>
        ) : (
          <div className="bg-black/40 border-2 border-[#78CCEE] rounded-2xl p-8 shadow-[0_0_30px_rgba(120,204,238,0.1)] animate-in fade-in zoom-in duration-300">
            
            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-white font-impact text-4xl tracking-wide leading-none mb-2">{selectedUser.name}</h2>
                <div className="flex gap-2">
                   <span className="bg-[#78CCEE]/20 text-[#78CCEE] px-2 py-1 rounded text-xs font-bold uppercase border border-[#78CCEE]/30">Active Participant</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white hover:bg-white/10 px-3 py-1 rounded transition-all text-sm font-bold uppercase"
              >
                Cancel ✕ 
              </button>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-6 rounded-xl border border-white/10 mb-8">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Talkshow Points</p>
                    <p className="text-[#41FFA3] text-5xl font-impact tracking-wider">{selectedUser.talkshowPoints}</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Global Points</p>
                    <p className="text-white text-3xl font-impact opacity-80">{selectedUser.totalPoints}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-[#78CCEE] text-xs font-bold uppercase tracking-widest mb-2 block">Amount to Add/Deduct</label>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPointAmount(Math.max(1, pointAmount - 5))} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-xl text-white text-2xl font-bold transition-all border border-white/10">-</button>
                        <input 
                            type="number" 
                            value={pointAmount}
                            onChange={(e) => setPointAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="flex-1 bg-black/50 text-center text-white text-3xl font-impact h-14 rounded-xl border border-white/20 focus:border-[#78CCEE] outline-none"
                        />
                        <button onClick={() => setPointAmount(pointAmount + 5)} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-xl text-white text-2xl font-bold transition-all border border-white/10">+</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    {/* BUTTON DEDUCT */}
                    <button
                        onClick={() => processTransaction(false)}
                        disabled={isLoading || selectedUser.talkshowPoints <= 0 || cooldown > 0}
                        className="bg-red-500/80 hover:bg-red-500 text-white font-impact text-xl py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-red-500/20"
                    >
                        {isLoading ? "..." : cooldown > 0 ? `WAIT ${cooldown}s` : "DEDUCT (-)"}
                    </button>
                    
                    {/* BUTTON ADD */}
                    <button
                        onClick={() => processTransaction(true)}
                        disabled={isLoading || cooldown > 0}
                        className="bg-[#41FFA3] hover:bg-[#00ff80] text-[#1a1a40] font-impact text-xl py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-[#41FFA3]/20"
                    >
                         {isLoading ? "..." : cooldown > 0 ? `WAIT ${cooldown}s` : "ADD POINTS (+)"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold uppercase tracking-wider animate-in slide-in-from-bottom-2 ${
                    message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                    {message.text}
                </div>
            )}
            
          </div>
        )}
      </div>

    </section>
  );
}