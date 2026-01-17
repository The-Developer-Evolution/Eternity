"use client";

import { useState, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { sellItems, SellItemPayload, SellItem, getUserInventory } from "@/features/trading/services/sell";
  import { Loader2, CheckCircle, AlertCircle, User, Package, Minus, Plus } from "lucide-react";

import { getRunningTradingPeriod } from "@/features/trading/action";
import { AllTradingData } from "@/features/user/types";

type InventoryItem = {
    id: string; // itemId or 'MAP'
    name: string;
    type: "RAW" | "CRAFT" | "MAP";
    owned: number;
    price: number; 
    currency: "ETERNITES" | "IDR";
};

interface SellInterfaceProps {
    rawItems: SellItem[];
    craftItems: SellItem[];
    mapPrice: number;
}

export default function SellInterface({ rawItems, craftItems, mapPrice }: SellInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<"RAW" | "CRAFT" | "MAP">("RAW");
  
  // Multi-select state: Record<itemId, amount>
  // Key format: `${type}-${id}` to be unique 
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  
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
  
  const toggleItem = (item: InventoryItem) => {
      const key = `${item.type}-${item.id}`;
      setSelectedItems(prev => {
          const next = { ...prev };
          if (next[key]) {
              delete next[key];
          } else {
              next[key] = 1;
          }
          return next;
      });
  };

  const updateItemAmount = (item: InventoryItem, val: number) => {
      if (val < 1 || val > item.owned) return;
      const key = `${item.type}-${item.id}`;
      setSelectedItems(prev => ({ ...prev, [key]: val }));
  };

  const handleSell = async () => {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (!selectedUser) return;
    
    // Prepare payload
    const itemsToSell: SellItemPayload[] = [];
    
    // Iterate over inventory to match with selected keys safely
    userInventory.forEach(invItem => {
        const key = `${invItem.type}-${invItem.id}`;
        if (selectedItems[key]) {
            itemsToSell.push({
                type: invItem.type,
                id: invItem.id === 'MAP' ? 'MAP' : invItem.id, 
                amount: selectedItems[key]
            });
        }
    });

    if (itemsToSell.length === 0) {
        setMessage({ type: "error", text: "Please select items to sell." });
        return;
    }

    // Confirmation
    const confirmed = window.confirm(`Are you sure you want to sell these items for ${selectedUser.name}?`);
    if (!confirmed) return;

    setIsTransacting(true);
    setCooldown(3);
    setMessage(null);

    try {
      const result = await sellItems(selectedUser.id, itemsToSell);
      
      if (result.success && result.data) {
        setMessage({ type: "success", text: result.message || "Sold successfully!" });
        setSelectedItems({}); // Clear selection
        
        // Update local inventory from result
        const tradingData = result.data as unknown as AllTradingData;
        
        const newInv: InventoryItem[] = [
            // Map
            {
                id: 'MAP', name: 'Treasure Map', type: 'MAP', 
                owned: tradingData.map, price: mapPrice, currency: 'IDR'
            },
            // Raw
            ...rawItems.map(r => ({
                id: r.id, name: r.name, type: 'RAW' as const,
                owned: Number(tradingData.rawUserAmounts.find(ua => ua.rawItemId === r.id)?.amount || 0),
                price: Number(r.price), currency: 'ETERNITES' as const
            })),
             // Craft
            ...craftItems.map(c => ({
                id: c.id, name: c.name, type: 'CRAFT' as const,
                owned: Number(tradingData.craftUserAmounts.find(ua => ua.craftItemId === c.id)?.amount || 0),
                price: Number(c.price), currency: 'ETERNITES' as const
            })),
        ];

        setUserInventory(newInv);

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

  // Filter items by tab
  const filteredItems = userInventory.filter(i => i.type === activeTab);

  // Calculate totals
  let totalEternites = 0;
  let totalIDR = 0;
  let totalCount = 0;

  userInventory.forEach(item => {
      const key = `${item.type}-${item.id}`;
      const qty = selectedItems[key];
      if (qty) {
          totalCount += qty;
          if (item.currency === 'IDR') {
              totalIDR += item.price * qty;
          } else {
              totalEternites += item.price * qty;
          }
      }
  });


  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      
      {/* LEFT: USER SEARCH */}
      <div className="col-span-1 bg-gray-900/80 backdrop-blur-md border border-cyan-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl h-fit">
        <h2 className="text-xl font-impact text-cyan-400 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <User className="text-cyan-400" /> SELLER
        </h2>
         <div className="flex flex-col gap-2 relative">
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
                  setUserInventory([]); // Clear inventory
                  setSelectedItems({});
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <Loader2 className="animate-spin text-cyan-400" size={20} />
              </div>
            )}
          </div>
          
          {matchingUsers.length > 0 && !selectedUser && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {matchingUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors"
                  onClick={async () => {
                    setSelectedUser(u);
                    setUserQuery(u.name);
                    setMatchingUsers([]);
                    
                    setMatchingUsers([]);
                    
                    const data = await getUserInventory(u.id);
                    if (data) {
                         const newInv: InventoryItem[] = [
                            { id: 'MAP', name: 'Treasure Map', type: 'MAP', owned: data.map, price: mapPrice, currency: 'IDR' },
                            ...rawItems.map(r => ({
                                id: r.id, name: r.name, type: 'RAW' as const,
                                owned: Number(data.rawUserAmounts.find(ua => ua.rawItemId === r.id)?.amount || 0),
                                price: Number(r.price), currency: 'ETERNITES' as const
                            })),
                            ...craftItems.map(c => ({
                                id: c.id, name: c.name, type: 'CRAFT' as const,
                                owned: Number(data.craftUserAmounts.find(ua => ua.craftItemId === c.id)?.amount || 0),
                                price: Number(c.price), currency: 'ETERNITES' as const
                            })),
                        ];
                        setUserInventory(newInv);
                    }
                  }}
                >
                  <span className="text-white font-medium">{u.name}</span>
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
      </div>

      {/* RIGHT: ITEM SELECTION */}
      <div className="col-span-1 md:col-span-2 bg-gray-900/80 backdrop-blur-md border border-cyan-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl min-h-[500px]">
         <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h2 className="text-xl font-impact text-cyan-400 tracking-wider flex items-center gap-2">
                 <Package className="text-cyan-400" /> INVENTORY
            </h2>
            <div className="flex gap-2">
                {(['RAW', 'CRAFT', 'MAP'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => { setActiveTab(type); }}
                        className={`px-4 py-1 rounded text-sm font-bold transition-all ${
                            activeTab === type 
                            ? "bg-cyan-600 text-white" 
                            : "bg-gray-800 text-gray-400 hover:text-white"
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
         </div>

         {/* ITEM GRID */}
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
            {filteredItems.map(item => {
                const key = `${item.type}-${item.id}`;
                const isSelected = !!selectedItems[key];
                
                return (
                <div
                    key={item.id}
                    className={`p-3 rounded-lg border flex flex-col justify-between h-[120px] transition-all relative overflow-hidden ${
                        isSelected
                         ? "bg-cyan-900/60 border-cyan-400"
                         : item.owned > 0 
                            ? "bg-gray-800 border-gray-600 hover:border-cyan-400" 
                            : "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                    }`}
                >
                    <div className="cursor-pointer" onClick={() => item.owned > 0 && toggleItem(item)}>
                        <div className="flex justify-between items-start w-full">
                            <span className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-gray-300"}`}>{item.name}</span>
                        </div>
                        
                        <div className="flex flex-col items-end mt-1">
                             <span className={`text-xs ${item.currency === 'IDR' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {item.price.toLocaleString()} {item.currency === 'IDR' ? 'IDR' : 'ET'}
                            </span>
                            <span className={`text-md font-bold ${item.owned > 0 ? "text-cyan-400" : "text-gray-600"}`}>
                                Owned: {item.owned}
                            </span>
                        </div>
                    </div>

                     {isSelected && (
                         <div className="flex items-center gap-1 mt-auto bg-black/40 p-1 rounded justify-between z-10">
                            <button 
                                className="p-1 hover:bg-white/10 rounded"
                                onClick={(e) => { e.stopPropagation(); updateItemAmount(item, (selectedItems[key] || 0) - 1); }}
                            >
                                <Minus size={12} className="text-gray-300" />
                            </button>
                            <input 
                                type="number"
                                min="1"
                                className="w-12 text-sm font-bold text-white font-mono bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={selectedItems[key]}
                                onChange={(e) => { e.stopPropagation(); updateItemAmount(item, parseInt(e.target.value) || 1); }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button 
                                className="p-1 hover:bg-white/10 rounded"
                                onClick={(e) => { e.stopPropagation(); updateItemAmount(item, (selectedItems[key] || 0) + 1); }}
                            >
                                <Plus size={12} className="text-gray-300" />
                            </button>
                        </div>
                    )}
                </div>
            )})}
            {filteredItems.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10 italic">No items found for this category.</div>
            )}
         </div>

         {/* SELL ACTION AREA */}
         <div className="mt-auto border-t border-gray-700 pt-4 flex flex-col md:flex-row gap-4 items-end justify-between">
            
            {/* SUMMARY */}
             <div className="flex flex-col text-sm text-gray-300">
                <div>Selected Items: <span className="text-white font-bold">{totalCount}</span></div>
                {totalEternites > 0 && (
                     <div>Total Eternites: <span className="text-yellow-400 font-bold">{totalEternites.toLocaleString()} ET</span></div>
                )}
                {totalIDR > 0 && (
                     <div>Total IDR: <span className="text-green-400 font-bold">{totalIDR.toLocaleString()} IDR</span></div>
                )}
             </div>

            {/* BUTTON */}
            <div className="flex gap-4 items-center w-full md:w-auto">
                <button
                onClick={handleSell}
                disabled={!selectedUser || totalCount === 0 || isTransacting || cooldown > 0}
                className={`px-8 py-3 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center gap-2 ${
                    !selectedUser || totalCount === 0 || isTransacting || cooldown > 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:scale-[1.02] hover:shadow-green-500/50"
                }`}
                >
                {isTransacting ? <Loader2 className="animate-spin" /> : ""} 
                {cooldown > 0 ? `Wait ${cooldown}s` : "SELL ITEMS"}
                </button>
            </div>
         </div>
         
         {/* MESSAGE */}
         {message && (
          <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
            message.type === "success" 
              ? "bg-green-900/50 border border-green-500 text-green-200" 
              : "bg-red-900/50 border border-red-500 text-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

      </div>
    </div>
  );
}
