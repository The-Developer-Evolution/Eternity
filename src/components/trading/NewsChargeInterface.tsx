"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { chargeEternities } from "@/features/trading/services/news";
import { Loader2, CheckCircle, AlertCircle, User, Zap, FileText } from "lucide-react";

export default function NewsChargeInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [amount, setAmount] = useState<string>("500")
  
  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Debounced search
  const performSearch = useMemo(
    () => debounce(async (query: string) => {
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

  const handleCharge = async () => {
    if (!selectedUser) return;

    const qty = parseInt(amount);
    if (isNaN(qty) || qty <= 0) {
         setMessage({ type: "error", text: "Invalid amount." });
         return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await chargeEternities(selectedUser.id, qty);
      
      if (result.success) {
        setMessage({ type: "success", text: "User charged successfully!" });
      } else {
        const errorMsg = Array.isArray(result.error) ? result.error.join(", ") : result.error;
        setMessage({ type: "error", text: errorMsg || "Transaction failed." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-purple-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl shadow-purple-900/20">
        <h2 className="text-2xl font-impact text-purple-400 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <FileText className="text-purple-400" /> NEWS
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> BUYER
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search User..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-purple-400 outline-none transition-all"
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
                <Loader2 className="animate-spin text-purple-400" size={20} />
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
            <div className="p-2 rounded flex flex-col gap-1 border bg-purple-900/30 border-purple-500/50">
                <div className="flex items-center gap-2 text-sm text-purple-300">
                    <CheckCircle size={16} /> Selected: <span className="font-bold">{selectedUser.name}</span>
                </div>
            </div>
           )}
        </div>

        {/* 2. REASON and AMOUNT */}
        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                 <label className="text-gray-400 text-sm font-bold">PRICE (ETERNITIES)</label>
                 <input 
                    type="number" 
                    min="1"
                    className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-purple-400 outline-none font-mono text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                 />
             </div>
         </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleCharge}
          disabled={!selectedUser || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:scale-[1.02] hover:shadow-purple-500/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> CHARGING...
            </>
          ) : (
            <>
              <Zap size={20} /> CHARGE USER
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
        <h3 className="text-xl font-impact text-gray-300">INVOICE PREVIEW</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">CUSTOMER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>

            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">ITEM</span>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-sm text-purple-300">Exclusive News</span>
                </div>
            </div>
            
             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-red-500/30">
                <span className="text-gray-400 text-sm">TOTAL CHARGE</span>
                <span className="font-bold text-2xl text-red-400 flex items-center gap-2">
                    - {parseInt(amount).toLocaleString()} ETERNITIES
                </span>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            User balance will be deducted immediately. Action cannot be undone.
        </div>
      </div>
    </div>
  );
}
