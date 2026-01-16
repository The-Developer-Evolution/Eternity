"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { buyBulkItemsBM, BlackMarketItemDetail } from "@/features/trading/services/blackmarket";
import { Loader2, CheckCircle, AlertCircle, User, ShoppingCart, Package, Minus, Plus } from "lucide-react";

interface BlackMarketInterfaceProps {
    items: BlackMarketItemDetail[];
}

export default function BlackMarketInterface({ items }: BlackMarketInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  // Multi-select state: Record<item_stock_id, amount>
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  
  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const rawItems = items.filter(i => i.type === 'RAW');
  const craftItems = items.filter(i => i.type === 'CRAFT');

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

  const toggleItem = (item: BlackMarketItemDetail) => {
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
      // Optional: Check stock limit
      const item = items.find(i => i.id === itemId);
      if (item && val > item.stock) return; 

      setSelectedItems(prev => ({ ...prev, [itemId]: val }));
  };

  const handleBuy = async () => {
    if (!selectedUser) return;

    const itemsToBuy = Object.entries(selectedItems).map(([id, amount]) => {
        const itemInfo = items.find(i => i.id === id);
        return {
            stockPeriodId: id,
            amount: amount,
            type: itemInfo?.type || 'RAW' // Default/Fallback, though should always be found
        };
    });

    if (itemsToBuy.length === 0) {
        setMessage({ type: "error", text: "Please select at least one item." });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await buyBulkItemsBM(selectedUser.id, itemsToBuy);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Purchase successful!" });
        setSelectedItems({}); // Clear selection
      } else {
        const errorMsg = Array.isArray(result.error) ? result.error.join(", ") : result.error;
        setMessage({ type: "error", text: errorMsg || "Transaction failed." });
      }
    } catch (error) {
        console.error(error);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsTransacting(false);
    }
  };

  // Calculations
  const totalCost = Object.entries(selectedItems).reduce((acc, [id, amount]) => {
      const item = items.find(i => i.id === id);
      return acc + (item ? item.price * amount : 0);
  }, 0);

  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="md:col-span-2 bg-gray-900/80 backdrop-blur-md border border-red-800 p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-red-500 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <ShoppingCart className="text-red-500" /> BLACK MARKET
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> BUYER
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search Buyer..."
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

        {/* 2. ITEM SELECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RAW ITEMS */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                    <Package size={16} /> RAW MATERIALS
                </label>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {rawItems.map((item) => {
                        const isSelected = !!selectedItems[item.id];
                        return (
                            <div
                                key={item.id}
                                className={`p-3 rounded text-sm flex flex-col justify-between transition-all border ${
                                    isSelected
                                    ? "bg-red-900/20 border-red-500" 
                                    : item.stock <= 0
                                        ? "bg-gray-800/50 text-gray-600 border-transparent cursor-not-allowed"
                                        : "bg-gray-800 text-gray-300 border-gray-600 hover:border-red-500"
                                }`}
                            >
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => item.stock > 0 && toggleItem(item)}>
                                    <span className={`font-bold ${isSelected ? "text-red-400" : ""}`}>{item.name}</span>
                                    <div className="flex flex-col items-end text-xs">
                                        <span className={item.stock > 0 ? "text-green-400" : "text-red-400"}>Stock: {item.stock}</span>
                                        <span className="text-yellow-500 font-mono">{item.price.toLocaleString("en-US")} E</span>
                                    </div>
                                </div>

                                {isSelected && (
                                     <div className="flex items-center gap-2 mt-2 bg-black/40 p-1 rounded justify-between border border-red-900/50">
                                        <button 
                                            className="p-1 hover:bg-white/10 rounded"
                                            onClick={() => updateItemAmount(item.id, selectedItems[item.id] - 1)}
                                        >
                                            <Minus size={14} className="text-gray-400" />
                                        </button>
                                        <span className="text-sm font-bold text-white font-mono">{selectedItems[item.id]}</span>
                                        <button 
                                            className="p-1 hover:bg-white/10 rounded"
                                            onClick={() => updateItemAmount(item.id, selectedItems[item.id] + 1)}
                                        >
                                            <Plus size={14} className="text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {rawItems.length === 0 && <div className="text-gray-500 italic text-sm">No raw items available.</div>}
                </div>
            </div>

            {/* CRAFT ITEMS */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                    <Package size={16} /> CRAFT ITEMS
                </label>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {craftItems.map((item) => {
                         const isSelected = !!selectedItems[item.id];
                         return (
                            <div
                                key={item.id}
                                className={`p-3 rounded text-sm flex flex-col justify-between transition-all border ${
                                    isSelected
                                    ? "bg-purple-900/20 border-purple-500" 
                                    : item.stock <= 0
                                        ? "bg-gray-800/50 text-gray-600 border-transparent cursor-not-allowed"
                                        : "bg-gray-800 text-gray-300 border-gray-600 hover:border-purple-500"
                                }`}
                            >
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => item.stock > 0 && toggleItem(item)}>
                                    <span className={`font-bold ${isSelected ? "text-purple-400" : ""}`}>{item.name}</span>
                                    <div className="flex flex-col items-end text-xs">
                                        <span className={item.stock > 0 ? "text-green-400" : "text-red-400"}>Stock: {item.stock}</span>
                                        <span className="text-yellow-500 font-mono">{item.price.toLocaleString("en-US")} E</span>
                                    </div>
                                </div>
                                
                                {isSelected && (
                                     <div className="flex items-center gap-2 mt-2 bg-black/40 p-1 rounded justify-between border border-purple-900/50">
                                        <button 
                                            className="p-1 hover:bg-white/10 rounded"
                                            onClick={() => updateItemAmount(item.id, selectedItems[item.id] - 1)}
                                        >
                                            <Minus size={14} className="text-gray-400" />
                                        </button>
                                        <span className="text-sm font-bold text-white font-mono">{selectedItems[item.id]}</span>
                                        <button 
                                            className="p-1 hover:bg-white/10 rounded"
                                            onClick={() => updateItemAmount(item.id, selectedItems[item.id] + 1)}
                                        >
                                            <Plus size={14} className="text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {craftItems.length === 0 && <div className="text-gray-500 italic text-sm">No craft items available.</div>}
                </div>
            </div>
        </div>

        {/* 3. BUY BUTTON */}
        <div className="flex justify-end pt-4">
             <button
                onClick={handleBuy}
                disabled={!selectedUser || Object.keys(selectedItems).length === 0 || isTransacting}
                className={`w-full md:w-auto py-3 px-8 rounded font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 h-[50px] ${
                    !selectedUser || Object.keys(selectedItems).length === 0 || isTransacting
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
            >
                 {isTransacting ? <Loader2 className="animate-spin" /> : <ShoppingCart size={20} />} BUY SELECTED
            </button>
        </div>

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
      <div className="md:col-span-1 flex flex-col gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-fit sticky top-4">
        <h3 className="text-xl font-impact text-gray-300">RECEIPT</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">BUYER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             
             {/* Selected Items List */}
             <div className="bg-black/30 p-4 rounded border border-red-900/30">
                <div className="text-xs text-gray-400 mb-2 font-bold uppercase border-b border-gray-700 pb-1">Items Selected</div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {Object.keys(selectedItems).length === 0 ? (
                        <div className="text-gray-500 italic text-sm">No items selected</div>
                    ) : (
                        Object.entries(selectedItems).map(([id, amount]) => {
                            const item = items.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div key={id} className="flex justify-between text-sm items-center">
                                    <span className="text-gray-300">{item.name}</span>
                                    <div className="text-right">
                                        <div className="font-mono text-red-400">{amount} x {item.price.toLocaleString("en-US")}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                 <div className="flex justify-between text-sm items-center mt-2 pt-2 border-t border-gray-700 font-bold">
                    <span className="text-gray-400">Total</span>
                    <span className="text-yellow-500">{totalCost.toLocaleString("en-US")} E</span>
                </div>
            </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
            Black Market transactions are final.
        </div>
      </div>
    </div>
  );
}
