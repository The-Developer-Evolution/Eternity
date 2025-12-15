"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { givePitchingMoney } from "@/features/trading/services/pitching";
import { Loader2, CheckCircle, AlertCircle, User, Award, DollarSign } from "lucide-react";

export default function PitchingRewardInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [amount, setAmount] = useState<number>(0);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Debounced search
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setMatchingUsers([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        setMatchingUsers(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    performSearch(userQuery);
  }, [userQuery, performSearch]);

  const handleGiveReward = async () => {
    if (!selectedUser || amount <= 0) return;

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await givePitchingMoney(selectedUser.id, amount);
      
      if (result.success) {
        setMessage({ type: "success", text: "Reward sent successfully!" });
        setAmount(0);
      } else {
        const errorMsg = Array.isArray(result.error) ? result.error.join(", ") : result.error;
        setMessage({ type: "error", text: errorMsg || "Transaction failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4 mt-8">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-[#F0A500] p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-[#F0A500] tracking-wider border-b border-gray-700 pb-2">
          PITCHING REWARD
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> RECIPIENT
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search by User Name..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-[#F0A500] outline-none transition-all"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.name) {
                  setSelectedUser(null);
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <Loader2 className="animate-spin text-[#F0A500]" size={20} />
              </div>
            )}
          </div>
          
          {/* USER RESULTS DROPDOWN */}
          {matchingUsers.length > 0 && !selectedUser && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {matchingUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors"
                  onClick={() => {
                    setSelectedUser(u);
                    setUserQuery(u.name);
                    setMatchingUsers([]);
                  }}
                >
                  <span className="text-white font-medium">{u.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">ID: ...{u.id.slice(-4)}</span>
                </div>
              ))}
            </div>
          )}

           {selectedUser && (
            <div className="bg-green-900/30 border border-green-500/50 p-2 rounded flex items-center gap-2 text-green-300 text-sm">
              <CheckCircle size={16} /> Selected: <span className="font-bold">{selectedUser.name}</span>
            </div>
           )}
        </div>

        {/* 2. AMOUNT INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm font-bold">REWARD AMOUNT (IDR)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={amount || ""}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 pl-12 focus:border-[#F0A500] outline-none text-xl font-mono"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="font-bold text-[#F0A500]">Rp</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleGiveReward}
          disabled={!selectedUser || amount <= 0 || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || amount <= 0 || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#F0A500] to-[#D68900] text-black hover:scale-[1.02] hover:shadow-[#F0A500]/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> PROCESSING...
            </>
          ) : (
            <>
              <Award size={20} /> SEND REWARD
            </>
          )}
        </button>

        {/* MESSAGE DISPLAY */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === "success" 
              ? "bg-green-900/50 border border-green-500 text-green-200" 
              : "bg-red-900/50 border border-red-500 text-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="hidden md:flex flex-col justify-center gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
        <h3 className="text-xl font-impact text-gray-300">REWARD SUMMARY</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">RECIPIENT</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">TYPE</span>
                <span className="font-bold text-lg uppercase text-[#F0A500]">PITCHING REWARD</span>
            </div>
            
             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-[#F0A500]/30">
                <span className="text-gray-400 text-sm">AMOUNT</span>
                <span className="font-bold text-2xl text-green-400">+ Rp {amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            Funds will be credited to user's IDR balance immediately.
        </div>
      </div>
    </div>
  );
}
