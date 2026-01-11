"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { giveEternityRewards } from "@/features/trading/services/thunt";
import { Loader2, CheckCircle, AlertCircle, User, Gem, Coins, Layers } from "lucide-react";

// Hardcoded reward mapping
const REWARD_OPTIONS = [
    { items: 1, eternities: 20 },
    { items: 2, eternities: 25 },
    { items: 3, eternities: 28 },
    { items: 4, eternities: 30 },
    { items: 5, eternities: 34 },
    { items: 6, eternities: 36 },
    { items: 7, eternities: 40 },
    { items: 8, eternities: 42 },
];

export default function RewardEternitiesInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [selectedOption, setSelectedOption] = useState(REWARD_OPTIONS[0]);
  
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

  const handleAddReward = async () => {
    if (!selectedUser) return;

    // Use the selected option's eternity amount
    const qty = selectedOption.eternities;
    
    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await giveEternityRewards(selectedUser.id, qty);
      
      if (result.success) {
        setMessage({ type: "success", text: `Added ${qty} Eternities for ${selectedOption.items} items!` });
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
    <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-cyan-400 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <Coins className="text-cyan-400" /> REWARD ETERNITIES
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> RECIPIENT
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search User..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-cyan-400 outline-none transition-all"
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
                <Loader2 className="animate-spin text-cyan-400" size={20} />
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
            <div className="p-2 rounded flex flex-col gap-1 border bg-green-900/30 border-green-500/50">
                <div className="flex items-center gap-2 text-sm text-green-300">
                    <CheckCircle size={16} /> Selected: <span className="font-bold">{selectedUser.name}</span>
                </div>
            </div>
           )}
        </div>

        {/* 2. REWARD SELECTION (BUTTONS) */}
         <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Layers size={16} /> SELECT ITEMS FOUND
             </label>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REWARD_OPTIONS.map((opt) => (
                    <button
                        key={opt.items}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${
                            selectedOption.items === opt.items
                            ? "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                            : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500"
                        }`}
                    >
                        <span className="text-sm font-bold">{opt.items} ITEM{opt.items > 1 ? 'S' : ''}</span>
                        <span className={`text-xs font-mono font-bold ${selectedOption.items === opt.items ? 'text-yellow-300' : 'text-cyan-600'}`}>
                            {opt.eternities} ET
                        </span>
                    </button>
                ))}
             </div>
         </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleAddReward}
          disabled={!selectedUser || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:scale-[1.02] hover:shadow-cyan-500/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> ADDING...
            </>
          ) : (
            <>
              <Gem size={20} /> SEND {selectedOption.eternities} REWARD
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
        <h3 className="text-xl font-impact text-gray-300">DISTRIBUTION PREVIEW</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">RECIPIENT</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
            
             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-cyan-500/30">
                <span className="text-gray-400 text-sm">ITEMS FOUND</span>
                <span className="font-bold text-xl text-white">
                    {selectedOption.items}
                </span>
            </div>

             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-green-500/30">
                <span className="text-gray-400 text-sm">REWARD</span>
                <span className="font-bold text-2xl text-green-400 flex items-center gap-2">
                    <Coins size={24} /> {selectedOption.eternities} ETERNITIES
                </span>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            Eternities will be added to user balance immediately.
        </div>
      </div>
    </div>
  );
}
