"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopRawItem, ShopUser, searchUsers } from "@/features/trading/services/shop";
import { buyMaterial } from "@/features/trading/services/buyRaw";
import { Loader2, CheckCircle, AlertCircle, ShoppingCart, User } from "lucide-react";

interface ShopInterfaceProps {
  initialItems: ShopRawItem[];
}

export default function ShopInterface({ initialItems }: ShopInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopRawItem | null>(null);
  const [amount, setAmount] = useState<number>(1);
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

  const handleBuy = async () => {
    if (!selectedUser || !selectedItem || amount <= 0) return;

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await buyMaterial(selectedUser.id, selectedItem.id, amount);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Purchase successful!" });
        setAmount(1);
        // Optional: clear selected item or user? Usually keep for consecutive buys.
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
      {/* LEFT COLUMN: SELECTION */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-[#AE00DE] p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-[#75E8F0] tracking-wider border-b border-gray-700 pb-2">
          TRADING TERMINAL
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> BUYER IDENTIFICATION
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search by User Name..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-[#75E8F0] outline-none transition-all"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.name) {
                  setSelectedUser(null); // Reset selection if typing
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <Loader2 className="animate-spin text-[#75E8F0]" size={20} />
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

        {/* 2. ITEM SELECTION */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <ShoppingCart size={16} /> SELECT RESOURCE
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {initialItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded border text-left transition-all relative overflow-hidden group ${
                  selectedItem?.id === item.id
                    ? "bg-[#AE00DE]/20 border-[#AE00DE] text-white shadow-[0_0_15px_rgba(174,0,222,0.3)]"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                <div className="font-bold text-sm uppercase">{item.name}</div>
                <div className="text-xs text-gray-400 mt-1">{item.price} E</div>
                {selectedItem?.id === item.id && (
                  <div className="absolute top-1 right-1">
                     <div className="w-2 h-2 rounded-full bg-[#AE00DE] shadow-[0_0_5px_#AE00DE]"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. AMOUNT INPUT */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm font-bold">QUANTITY</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-[#75E8F0] outline-none text-xl font-mono"
            />
            <div className="whitespace-nowrap text-gray-400 text-sm">
              Total: <span className="text-[#AE00DE] font-bold text-lg">
                {(selectedItem?.price || 0) * amount} E
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleBuy}
          disabled={!selectedUser || !selectedItem || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg ${
            !selectedUser || !selectedItem || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#AE00DE] to-[#7116C9] text-white hover:scale-[1.02] hover:shadow-[#AE00DE]/50"
          }`}
        >
          {isTransacting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> PROCESSING...
            </div>
          ) : (
            "CONFIRM TRANSACTION"
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

      {/* RIGHT COLUMN: INFO / PREVIEW */}
      <div className="hidden md:flex flex-col justify-center gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
        <h3 className="text-xl font-impact text-gray-300">TRANSACTION SUMMARY</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">BUYER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">ITEM</span>
                <span className="font-bold text-lg uppercase text-[#75E8F0]">{selectedItem?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">QUANTITY</span>
                <span className="font-bold text-lg font-mono">{amount}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-[#AE00DE]/30">
                <span className="text-gray-400 text-sm">TOTAL COST</span>
                <span className="font-bold text-2xl text-[#AE00DE]">{(selectedItem?.price || 0) * amount} E</span>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            Authorized Personnel Only. <br/> All transactions are logged and irreversible.
        </div>
      </div>
    </div>
  );
}
