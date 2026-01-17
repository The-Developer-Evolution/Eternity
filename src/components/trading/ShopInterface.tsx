"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopRawItem, ShopUser, searchUsers } from "@/features/trading/services/shop";
import { buyCustomRawMaterials } from "@/features/trading/services/buyRaw";
import { Loader2, CheckCircle, AlertCircle, ShoppingCart, User, Plus, Minus } from "lucide-react";

interface ShopInterfaceProps {
  initialItems: ShopRawItem[];
}

export default function ShopInterface({ initialItems }: ShopInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  // Multi-select state: Record<itemId, amount>
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  // Transaction fee removed as input is commented out
  const transactionFee = "0";

  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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

  const toggleItem = (item: ShopRawItem) => {
      setSelectedItems(prev => {
          const next = { ...prev };
          if (next[item.id]) {
              delete next[item.id];
          } else {
              next[item.id] = 1;
          }
          return next;
      });
  };

  const updateItemAmount = (itemId: string, val: number) => {
      if (val < 1) return;
      setSelectedItems(prev => ({ ...prev, [itemId]: val }));
  };

  const handleBuy = async () => {
    if (!selectedUser) return;

    const itemsToBuy = Object.entries(selectedItems)
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => ({ id, amount }));

    if (itemsToBuy.length === 0) {
        setMessage({ type: "error", text: "Please select at least one item." });
        return;
    }

    const fee = parseInt(transactionFee);
    if (isNaN(fee) || fee < 0) {
         setMessage({ type: "error", text: "Invalid transaction fee." });
         return;
    }

    setIsTransacting(true);
    setCooldown(3);
    setMessage(null);

    // Confirmation
    const confirmed = window.confirm(`Are you sure you want to complete this purchase for ${selectedUser.name}?`);
    if (!confirmed) {
      setIsTransacting(false);
      return;
    }

    try {
      const result = await buyCustomRawMaterials(selectedUser.id, itemsToBuy, fee);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Purchase successful!" });
        setSelectedItems({}); // Clear selection after success
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

  // Calculate totals for summary
  const totalItemCost = Object.entries(selectedItems).reduce((acc, [id, amount]) => {
      const item = initialItems.find(i => i.id === id);
      return acc + (item ? item.price * amount : 0);
  }, 0);

  const totalCost = totalItemCost + (parseInt(transactionFee) || 0);

  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: SELECTION */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-[#AE00DE] p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-[#75E8F0] tracking-wider border-b border-gray-700 pb-2">
          RAW MATERIAL
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
                  setSelectedUser(null);
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
        <div className="flex flex-col gap-2 flex-grow">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <ShoppingCart size={16} /> SELECT RESOURCE
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[400px] pr-1">
            {initialItems.map((item) => {
                const isSelected = !!selectedItems[item.id];
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded border transition-all relative overflow-hidden group flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#AE00DE]/20 border-[#AE00DE]"
                        : "bg-gray-800 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="cursor-pointer" onClick={() => toggleItem(item)}>
                        <div className={`font-bold text-sm uppercase ${isSelected ? "text-white" : "text-gray-300"}`}>{item.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.price} E</div>
                    </div>

                    {isSelected ? (
                         <div className="flex items-center gap-2 mt-2 bg-black/40 p-1 rounded justify-between">
                            <button 
                                className="p-1 hover:bg-white/10 rounded"
                                onClick={() => updateItemAmount(item.id, selectedItems[item.id] - 1)}
                            >
                                <Minus size={14} className="text-gray-400" />
                            </button>
                            <input 
                                type="number"
                                min="1"
                                className="w-12 text-sm font-bold text-white font-mono bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={selectedItems[item.id]}
                                onChange={(e) => updateItemAmount(item.id, parseInt(e.target.value) || 1)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button 
                                className="p-1 hover:bg-white/10 rounded"
                                onClick={() => updateItemAmount(item.id, selectedItems[item.id] + 1)}
                            >
                                <Plus size={14} className="text-gray-400" />
                            </button>
                        </div>
                    ) : (
                         <div className="mt-2 h-7"></div> // Vertical spacer
                    )}
                    
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                         <div className="w-2 h-2 rounded-full bg-[#AE00DE] shadow-[0_0_5px_#AE00DE]"></div>
                      </div>
                    )}
                  </div>
                );
            })}
          </div>
        </div>

        {/* 3. TRANSACTION COST */}
        {/* <div className="flex flex-col gap-2">
           <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Coins size={16} /> TRANSACTION COST (ETERNITES)
           </label>
           <input 
                type="number"
                min="0"
                value={transactionFee}
                onChange={(e) => setTransactionFee(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-[#75E8F0] outline-none"
           />
        </div> */}

        {/* ACTION BUTTON */}
        <button
          onClick={handleBuy}
          disabled={!selectedUser || Object.keys(selectedItems).length === 0 || isTransacting || cooldown > 0}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg ${
            !selectedUser || Object.keys(selectedItems).length === 0 || isTransacting || cooldown > 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#AE00DE] to-[#7116C9] text-white hover:scale-[1.02] hover:shadow-[#AE00DE]/50"
          }`}
        >
          {isTransacting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> PROCESSING...
            </div>
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s`
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
      <div className="hidden md:flex flex-col gap-6 text-white sticky top-4 h-fit">
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-impact text-gray-300 mb-4">TRANSACTION SUMMARY</h3>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                    <span className="text-gray-400 text-sm">BUYER</span>
                    <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
                </div>

                <div className="bg-black/30 p-4 rounded border border-[#AE00DE]/30">
                    <div className="text-xs text-gray-400 mb-2 font-bold uppercase border-b border-gray-700 pb-1">Items Selected</div>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {Object.keys(selectedItems).length === 0 ? (
                            <div className="text-gray-500 italic text-sm">No items selected</div>
                        ) : (
                            Object.entries(selectedItems).map(([id, amount]) => {
                                const item = initialItems.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between text-sm items-center">
                                        <span className="text-gray-300">{item.name}</span>
                                        <div className="text-right">
                                            <div className="font-mono text-[#75E8F0]">{amount} x {item.price} = {amount * item.price}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                     <div className="flex justify-between text-sm items-center mt-2 pt-2 border-t border-gray-700 font-bold">
                        <span className="text-gray-400">Items Subtotal</span>
                        <span className="text-[#AE00DE]">{totalItemCost} E</span>
                    </div>
                </div>

                 <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                    <span className="text-gray-400 text-sm">TRANSACTION FEE</span>
                    <span className="font-bold text-lg font-mono text-red-300">+ {transactionFee || 0} E</span>
                </div>

                 <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-[#AE00DE]/50">
                    <span className="text-gray-400 text-sm">TOTAL COST</span>
                    <span className="font-bold text-2xl text-[#AE00DE]">{totalCost} E</span>
                </div>
            </div>
            
            <div className="mt-8 text-xs text-gray-500 text-center">
                Authorized Personnel Only. <br/> All transactions are logged and irreversible.
            </div>
        </div>
      </div>
    </div>
  );
}
