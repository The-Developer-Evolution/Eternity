"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { payBlackMarketFee } from "@/features/trading/services/blackmarket";
import { Loader2, CheckCircle, AlertCircle, User, ShieldAlert, FileText } from "lucide-react";

export default function BlackmarketGuardInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const BM_FEE = 20000;

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

  const handlePayFee = async () => {
    if (!selectedUser) return;

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await payBlackMarketFee(selectedUser.id);
      
      if (result.success) {
        setMessage({ type: "success", text: "Black Market entry fee paid successfully!" });
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
      <div className="bg-gray-900/80 backdrop-blur-md border border-red-800 p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-red-500 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <ShieldAlert className="text-red-500" /> BLACK MARKET GUARD
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> VISITOR
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search Visitor Name..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-red-500 outline-none transition-all"
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
                <Loader2 className="animate-spin text-red-500" size={20} />
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

        {/* INFO BOX */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-500 font-bold">
                 <FileText size={18} /> FEE DETAILS
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Transaction Type</span>
                <span className="text-white">Black Market Entry</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Required Amount</span>
                <span className="text-red-500 font-bold font-mono text-lg">{BM_FEE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Eternites</span>
            </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handlePayFee}
          disabled={!selectedUser || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-[1.02] hover:shadow-red-500/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> PROCESSING...
            </>
          ) : (
            <>
              <ShieldAlert size={20} /> CHARGE ENTRY FEE
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
        <h3 className="text-xl font-impact text-gray-300">RECEIPT PREVIEW</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">PAYER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">DESCRIPTION</span>
                <span className="font-bold text-lg uppercase text-red-500">ENTRY FEE</span>
            </div>
            
             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-red-500/30">
                <span className="text-gray-400 text-sm">AMOUNT DUE</span>
                <span className="font-bold text-2xl text-red-400">- {BM_FEE.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} E</span>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            Authorized personnel only.
        </div>
      </div>
    </div>
  );
}
