"use client";

import { useState, useEffect, useRef } from "react";
import CardPanel from "./CardPanel";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  rallyData?: {
    enonix: number;
    point: number;
  };
}

interface EonixPanelProps {
  users?: User[];
  onAddEonix: (userId: string, amount: number) => Promise<any>;
  onSubtractEonix: (userId: string, amount: number) => Promise<any>;
}

export default function EonixPanel({
  users = [],
  onAddEonix,
  onSubtractEonix,
}: EonixPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- STATE: Cooldown ---
  const [cooldown, setCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

  // --- EFFECT: Timer ---
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
    setError(null);
    setSuccess(null);
    setCooldown(0); 
  };

  const updateLocalState = (userId: string, newEonix: number) => {
    const update = (prev: User[]) => prev.map(u => u.id === userId ? { ...u, rallyData: { ...u.rallyData!, enonix: newEonix } } : u);
    setAllUsers(update);
    setFilteredUsers(update);
    setSelectedUser(prev => prev?.id === userId ? { ...prev, rallyData: { ...prev.rallyData!, enonix: newEonix } } : prev);
  };

  const processAction = async (actionFn: any, isSubtract: boolean) => {
    if (!selectedUser) return setError("Select a user");
    
    // 1. Check Cooldown & Loading
    if (isLoading || cooldown > 0) return;

    // 2. Alert Confirmation
    const actionName = isSubtract ? "SUBTRACT EONIX" : "ADD EONIX";
    const confirmMessage = `Are you sure you want to ${actionName} for user ${selectedUser.name} with amount ${amount}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await actionFn(selectedUser.id, amount);
      if (result.success) {
        const currentEonix = selectedUser.rallyData?.enonix || 0;
        const nextValue = isSubtract ? Math.max(0, currentEonix - amount) : currentEonix + amount;
        updateLocalState(selectedUser.id, nextValue);
        setSuccess("Operation Successful");
        toast.success("Operation Successful");

        // 3. Set Cooldown 5 Seconds
        setCooldown(5); 

      } else {
        setError(result.error || "Operation Failed");
        toast.error(result.error || "Operation Failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardPanel title="EONIX MANAGER" extraClass="">
      <div className="relative w-full" ref={dropdownRef}>
        <label className="block text-xs font-bold text-[#E0B0FF] uppercase mb-1 tracking-widest">Search Participant</label>
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Click to select user..."
          className="w-full bg-black/40 text-white px-4 py-3 rounded-lg border-2 border-[#E0B0FF]/30 focus:border-[#E0B0FF] outline-none transition-all"
        />

        {showDropdown && (
          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-black/40 border-2 border-[#E0B0FF] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
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
                    <span className="text-[#E0B0FF] text-xs font-impact block">E: {user.rallyData?.enonix || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-slate-500 text-center text-sm italic">No users found</div>
            )}
          </div>
        )}
      </div>

      <div className={`p-5 w-full rounded-2xl border-2 transition-all duration-500 ${selectedUser ? "bg-black/40 border-[#E0B0FF] shadow-lg shadow-[#E0B0FF]/10" : "bg-black/40 border-[#E0B0FF] border-dashed"}`}>
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
                <p className="text-[10px] text-[#E0B0FF] font-bold uppercase mt-1">Status: Active Participant</p>
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
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Current Eonix</p>
                <p className="text-3xl font-impact text-[#E0B0FF]">{selectedUser.rallyData?.enonix || 0}</p>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Current Point</p>
                <p className="text-3xl font-impact text-[#41FFA3]">{selectedUser.rallyData?.point || 0}</p>
              </div>
            </div>

            <div className="mb-6">
               <p className="text-center text-[10px] text-[#E0B0FF] font-bold uppercase mb-2 tracking-[0.2em]">Transaction Amount</p>
               <div className="flex items-center gap-4 bg-black/60 p-2 rounded-xl border border-white/10">
                <button onClick={() => setAmount(Math.max(1, amount - 50))} className="w-10 h-10 bg-white/5 rounded-lg hover:bg-white/10 text-white font-bold text-xl transition-all active:scale-90">-</button>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-transparent text-center text-white font-impact text-2xl outline-none"
                />
                <button onClick={() => setAmount(amount + 50)} className="w-10 h-10 bg-white/5 rounded-lg hover:bg-white/10 text-white font-bold text-xl transition-all active:scale-90">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => processAction(onAddEonix, false)}
                disabled={isLoading || cooldown > 0}
                className="bg-[#E0B0FF] hover:bg-[#c99be6] disabled:bg-slate-800 text-[#3E344A] font-impact py-3 rounded-xl text-lg transition-all active:scale-95 shadow-lg shadow-[#E0B0FF]/20 disabled:cursor-not-allowed"
              >
                 {isLoading ? "..." : cooldown > 0 ? `WAIT ${cooldown}s` : "ADD EONIX"}
              </button>
              <button
                onClick={() => processAction(onSubtractEonix, true)}
                disabled={isLoading || (selectedUser.rallyData?.enonix || 0) === 0 || cooldown > 0}
                className="bg-red-500 hover:bg-red-600 disabled:bg-slate-800 text-white font-impact py-3 rounded-xl text-lg transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-red-500/20 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : cooldown > 0 ? `WAIT ${cooldown}s` : "SUBTRACT EONIX"}
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
