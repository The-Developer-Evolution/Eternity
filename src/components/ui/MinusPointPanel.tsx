"use client";

import { useState, useEffect, useRef } from "react";
import CardPanel from "./CardPanel";

interface User {
  id: string;
  name: string;
  rallyData?: {
    minus_point: number;
    point: number;
  };
}

interface MinusPointPanelProps {
  users?: User[];
  onMinusPoint: (userId: string, points: number) => Promise<any>;
  onNeutralizePoint: (userId: string, points: number) => Promise<any>;
}

export default function MinusPointPanel({
  users = [],
  onMinusPoint,
  onNeutralizePoint,
}: MinusPointPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

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
    setError(null);
    setSuccess(null);
  };

  const updateLocalState = (userId: string, newMinus: number) => {
    const update = (prev: User[]) => prev.map(u => u.id === userId ? { ...u, rallyData: { ...u.rallyData!, minus_point: newMinus } } : u);
    setAllUsers(update);
    setFilteredUsers(update);
    setSelectedUser(prev => prev?.id === userId ? { ...prev, rallyData: { ...prev.rallyData!, minus_point: newMinus } } : prev);
  };

  const processAction = async (actionFn: any, isNeutralize: boolean) => {
    if (!selectedUser) return setError("Select a user");
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await actionFn(selectedUser.id, pointAmount);
      if (result.success) {
        const currentMinus = selectedUser.rallyData?.minus_point || 0;
        const nextValue = isNeutralize ? Math.max(0, currentMinus - pointAmount) : currentMinus + pointAmount;
        updateLocalState(selectedUser.id, nextValue);
        setSuccess("Operation Successful");
      } else {
        setError(result.error || "Operation Failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardPanel title="MINUS POINT MANAGER" extraClass="">
      <div className="relative w-full" ref={dropdownRef}>
        <label className="block text-xs font-bold text-[#78CCEE] uppercase mb-1 tracking-widest">Search Participant</label>
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Click to select user..."
          className="w-full bg-black/40 text-white px-4 py-3 rounded-lg border-2 border-[#78CCEE]/30 focus:border-[#78CCEE] outline-none transition-all"
        />

        {showDropdown && (
          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-black/40 border-2 border-[#78CCEE] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="p-3 border-b border-white/5 bg-black hover:bg-gray-900 backdrop-blur-2xl cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="text-white font-bold">{user.name}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-tighter">ID: {user.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-red-400 text-xs font-impact block">M: {user.rallyData?.minus_point || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-slate-500 text-center text-sm italic">No users found</div>
            )}
          </div>
        )}
      </div>

      <div className={`p-5 w-full rounded-2xl border-2 transition-all duration-500 ${selectedUser ? "bg-black/40 border-[#78CCEE] shadow-lg shadow-[#78CCEE]/10" : "bg-black/40 border-[#78CCEE] border-dashed"}`}>
        {!selectedUser ? (
          <div className="text-center opacity-70">
            <div className="w-12 h-12 border-2 border-dashed border-white rounded-full flex items-center justify-center mx-auto mb-3 text-white">?</div>
            <p className="text-white text-sm font-bold uppercase tracking-widest">No Selection</p>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-impact text-2xl uppercase tracking-tighter leading-none">{selectedUser.name}</h3>
                <p className="text-[10px] text-[#78CCEE] font-bold uppercase mt-1">Status: Active Participant</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-2 py-1 rounded text-[10px] border border-white/10 transition-all uppercase font-bold"
              >
                ✕ Clear
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Current Minus</p>
                <p className="text-3xl font-impact text-red-400">{selectedUser.rallyData?.minus_point || 0}</p>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Current Point</p>
                <p className="text-3xl font-impact text-[#41FFA3]">{selectedUser.rallyData?.point || 0}</p>
              </div>
            </div>

            <div className="mb-6">
               <p className="text-center text-[10px] text-[#78CCEE] font-bold uppercase mb-2 tracking-[0.2em]">Transaction Amount</p>
               <div className="flex items-center gap-4 bg-black/60 p-2 rounded-xl border border-white/10">
                <button onClick={() => setPointAmount(Math.max(1, pointAmount - 1))} className="w-10 h-10 bg-white/5 rounded-lg hover:bg-white/10 text-white font-bold text-xl transition-all active:scale-90">-</button>
                <input 
                  type="number" 
                  value={pointAmount} 
                  onChange={(e) => setPointAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-transparent text-center text-white font-impact text-2xl outline-none"
                />
                <button onClick={() => setPointAmount(pointAmount + 1)} className="w-10 h-10 bg-white/5 rounded-lg hover:bg-white/10 text-white font-bold text-xl transition-all active:scale-90">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => processAction(onMinusPoint, false)}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-slate-800 text-white font-impact py-3 rounded-xl text-lg transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                {isLoading ? "..." : "ADD MINUS"}
              </button>
              <button
                onClick={() => processAction(onNeutralizePoint, true)}
                disabled={isLoading || (selectedUser.rallyData?.minus_point || 0) === 0}
                className="bg-[#41FFA3] hover:bg-[#2ee089] disabled:bg-slate-800 text-[#3E344A] font-impact py-3 rounded-xl text-lg transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-green-500/20"
              >
                {isLoading ? "..." : "NEUTRALIZE"}
              </button>
            </div>
          </div>
        )}
      </div>

      {(error || success) && (
        <div className={`mt-6 p-4 rounded-xl text-center text-xs font-bold border-2 animate-in slide-in-from-top-2 ${error ? "bg-red-500/10 border-red-500 text-red-500" : "bg-green-500/10 border-green-500 text-green-500"}`}>
          {error ? `⚠️ ERROR: ${error}` : `✅ SUCCESS: ${success}`}
        </div>
      )}
    </CardPanel>
  );
}