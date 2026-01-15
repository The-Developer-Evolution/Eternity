"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { sellBulkItemsBM, BlackMarketItemDetail } from "@/features/trading/services/blackmarket";
import { getUserInventory } from "@/features/trading/services/sell"; 
import { Loader2, CheckCircle, AlertCircle, User, Package, Minus, Plus, DollarSign } from "lucide-react";

interface BlackMarketSellInterfaceProps {
    items: BlackMarketItemDetail[];
}

// We don't need a complex InventoryItem type anymore for state, 
// strictly we just need to know user amounts.
// But keeping a structure helps for unified rendering.

export default function BlackMarketSellInterface({ items }: BlackMarketSellInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  // Store user owned amounts: Record<itemId, amount>
  const [userAmounts, setUserAmounts] = useState<Record<string, number>>({});
  
  const [activeTab, setActiveTab] = useState<"RAW" | "CRAFT">("RAW");
  
  // Multi-select state: Record<ITEM_ID, sell_amount>
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  
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
  
  // Helper to fetch and update inventory
  const fetchUserInventory = async (userId: string) => {
      const data = await getUserInventory(userId);
      if (data) {
          const amounts: Record<string, number> = {};
          
          data.rawUserAmounts.forEach((ua: any) => {
              amounts[ua.rawItemId] = ua.amount;
          });
          data.craftUserAmounts.forEach((ua: any) => {
              amounts[ua.craftItemId] = ua.amount;
          });
          
          setUserAmounts(amounts);
      }
  };

  const toggleItem = (itemId: string, maxOwned: number) => {
      if (maxOwned <= 0) return;
      
      setSelectedItems(prev => {
          const next = { ...prev };
          if (next[itemId]) {
              delete next[itemId];
          } else {
              next[itemId] = 1;
          }
          return next;
      });
  };

  const updateItemAmount = (itemId: string, val: number, maxOwned: number) => {
      if (val < 1 || val > maxOwned) return;
      setSelectedItems(prev => ({ ...prev, [itemId]: val }));
  };

  const handleSell = async () => {
    if (!selectedUser) return;
    
    // Prepare payload
    const itemsToSell = Object.entries(selectedItems).map(([id, amount]) => {
        const itemInfo = items.find(i => i.itemId === id); // items prop has itemId
        return {
            id: id,
            amount: amount,
            type: itemInfo?.type || 'RAW' 
        };
    });

    if (itemsToSell.length === 0) {
        setMessage({ type: "error", text: "Please select items to sell." });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await sellBulkItemsBM(selectedUser.id, itemsToSell as any);
      
      if (result.success && result.data) {
        setMessage({ type: "success", text: result.message || "Sold successfully!" });
        setSelectedItems({}); // Clear selection
        
        // Refresh inventory
        const amounts: Record<string, number> = {};
        const data = result.data as any;
        
        if (data.rawUserAmounts) {
            data.rawUserAmounts.forEach((ua: any) => amounts[ua.rawItemId] = ua.amount);
        }
        if (data.craftUserAmounts) {
             data.craftUserAmounts.forEach((ua: any) => amounts[ua.craftItemId] = ua.amount);
        }
        setUserAmounts(amounts);

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

  // Filter items by tab
  // Show ALL items from the `items` prop that match the `activeTab`.
  const displayedItems = useMemo(() => {
      return items.filter(i => i.type === activeTab);
  }, [items, activeTab]);

  // Calculate totals
  let totalPay = 0;
  let totalCount = 0;

  Object.entries(selectedItems).forEach(([id, qty]) => {
      const item = items.find(i => i.itemId === id);
      if (item) {
          totalCount += qty;
          totalPay += item.price * qty;
      }
  });

  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 p-4 mt-8 bg-black/20 rounded-xl border border-red-900/30">
        <div className="col-span-full mb-4 border-b border-red-900/50 pb-2">
            <h2 className="text-3xl font-impact text-red-500 tracking-wider flex items-center gap-2">
                 <DollarSign className="text-red-500" /> SELL TO BLACK MARKET
            </h2>
            <p className="text-gray-400 text-sm">Sell items back to the Black Market at current market rates.</p>
        </div>
      
      {/* LEFT: USER SEARCH */}
      <div className="col-span-1 bg-gray-900/80 backdrop-blur-md border border-red-800 p-6 rounded-xl flex flex-col gap-6 shadow-2xl h-fit">
        <h2 className="text-xl font-impact text-red-400 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <User className="text-red-400" /> SELLER
        </h2>
         <div className="flex flex-col gap-2 relative">
          <div className="relative">
             <input
              type="text"
              placeholder="Search Seller..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-red-400 outline-none transition-all"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.name) {
                  setSelectedUser(null);
                  setUserAmounts({}); // Clear inventory
                  setSelectedItems({});
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <Loader2 className="animate-spin text-red-400" size={20} />
              </div>
            )}
          </div>
          
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
                    fetchUserInventory(u.id);
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
      <div className="col-span-1 md:col-span-2 bg-gray-900/80 backdrop-blur-md border border-red-800 p-6 rounded-xl flex flex-col gap-6 shadow-2xl min-h-[500px]">
         <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h2 className="text-xl font-impact text-red-400 tracking-wider flex items-center gap-2">
                 <Package className="text-red-400" /> MARKET ITEMS
            </h2>
            <div className="flex gap-2">
                {(['RAW', 'CRAFT'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => { setActiveTab(type); }}
                        className={`px-4 py-1 rounded text-sm font-bold transition-all ${
                            activeTab === type 
                            ? "bg-red-600 text-white" 
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
            {displayedItems.map(item => {
                const owned = userAmounts[item.itemId] || 0;
                const isSelected = !!selectedItems[item.itemId];
                
                return (
                <div
                    key={item.itemId}
                    className={`p-3 rounded-lg border flex flex-col justify-between h-[120px] transition-all relative overflow-hidden ${
                         isSelected
                             ? "bg-red-900/60 border-red-400"
                             : owned > 0 
                                ? "bg-gray-800 border-gray-600 hover:border-red-400" 
                                : "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                    }`}
                >
                    <div className="cursor-pointer" onClick={() => owned > 0 && toggleItem(item.itemId, owned)}>
                        <div className="flex justify-between items-start w-full">
                            <span className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-gray-300"}`}>{item.name}</span>
                        </div>
                        
                        <div className="flex flex-col items-end mt-1">
                             <span className="text-xs text-yellow-500 font-mono">
                                {item.price.toLocaleString()} E
                            </span>
                            <span className={`text-md font-bold ${owned > 0 ? "text-green-400" : "text-red-900"}`}>
                                Owned: {owned}
                            </span>
                        </div>
                    </div>

                     {isSelected && (
                         <div className="flex items-center gap-1 mt-auto bg-black/40 p-1 rounded justify-between z-10 border border-red-900/50">
                            <button 
                                className="p-1 hover:bg-white/10 rounded"
                                onClick={(e) => { e.stopPropagation(); updateItemAmount(item.itemId, (selectedItems[item.itemId] || 0) - 1, owned); }}
                            >
                                <Minus size={12} className="text-gray-300" />
                            </button>
                            <span className="text-sm font-bold text-white font-mono">{selectedItems[item.itemId]}</span>
                            <button 
                                className="p-1 hover:bg-white/10 rounded"
                                onClick={(e) => { e.stopPropagation(); updateItemAmount(item.itemId, (selectedItems[item.itemId] || 0) + 1, owned); }}
                            >
                                <Plus size={12} className="text-gray-300" />
                            </button>
                        </div>
                    )}
                </div>
            )})}
            {displayedItems.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10 italic">No items available in this category.</div>
            )}
         </div>

         {/* SELL ACTION AREA */}
         <div className="mt-auto border-t border-gray-700 pt-4 flex flex-col md:flex-row gap-4 items-end justify-between">
            
            {/* SUMMARY */}
             <div className="flex flex-col text-sm text-gray-300">
                <div>Selected Items: <span className="text-white font-bold">{totalCount}</span></div>
                {totalPay > 0 && (
                     <div>Total Payout: <span className="text-yellow-500 font-bold">{totalPay.toLocaleString()} E</span></div>
                )}
             </div>

            {/* BUTTON */}
            <div className="flex gap-4 items-center w-full md:w-auto">
                <button
                onClick={handleSell}
                disabled={!selectedUser || totalCount === 0 || isTransacting}
                className={`px-8 py-3 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center gap-2 ${
                    !selectedUser || totalCount === 0 || isTransacting
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500 hover:shadow-red-500/50"
                }`}
                >
                {isTransacting ? <Loader2 className="animate-spin" /> : ""} 
                SELL ITEMS
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
