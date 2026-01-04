"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { craftMapWithCustomRecipe } from "@/features/trading/services/map";
import { getUserInventory } from "@/features/trading/services/sell";
import { Loader2, CheckCircle, AlertCircle, User, Map as MapIcon, Hammer, Plus, Minus, Coins } from "lucide-react";

// Helper type from craft.ts return type (approximate for UI)
interface CraftItemUI {
  id: string;
  name: string;
  // recipes: ... (we don't need recipe details here, just the item info)
}

interface MapCraftInterfaceProps {
    craftItems: CraftItemUI[];
}

export default function MapCraftInterface({ craftItems }: MapCraftInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  // Custom Recipe State
  // Map<craftItemId, amount>
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [cost, setCost] = useState<string>("0");
  const [amount, setAmount] = useState<string>("1"); // Map quantity
  
  // User Inventory State
  interface UserInventoryItem { craftItemId: string; amount: bigint; }
  const [userInventory, setUserInventory] = useState<UserInventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

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

  // Fetch Inventory when user is selected
  useEffect(() => {
      if (selectedUser) {
          setIsLoadingInventory(true);
          getUserInventory(selectedUser.id)
              .then((data) => {
                  if (data) {
                      // Map BigInt to simpler structure if needed, or keep as is.
                      setUserInventory(data.craftUserAmounts as unknown as UserInventoryItem[]);
                  }
              })
              .catch(err => console.error("Inventory fetch failed", err))
              .finally(() => setIsLoadingInventory(false));
      } else {
          setUserInventory([]);
      }
  }, [selectedUser]);

  const toggleItem = (itemId: string) => {
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

  const updateItemAmount = (itemId: string, val: number) => {
      if (val < 1) return;
      setSelectedItems(prev => ({ ...prev, [itemId]: val }));
  };

  const handleCraft = async () => {
    if (!selectedUser) return;

    const mapQty = parseInt(amount);
    const costVal = parseInt(cost);
    
    if (isNaN(mapQty) || mapQty <= 0) {
         setMessage({ type: "error", text: "Invalid map quantity." });
         return;
    }
    if (isNaN(costVal) || costVal < 0) {
        setMessage({ type: "error", text: "Invalid cost." });
        return;
   }

    const components = Object.entries(selectedItems).filter(([_, qty]) => qty > 0);
    if (components.length === 0) {
        setMessage({ type: "error", text: "Please select at least one material." });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await craftMapWithCustomRecipe(selectedUser.id, components, costVal, mapQty);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Map crafted successfully!" });
        // Refresh inventory? 
        // We can just rely on the result data or re-fetch.
        // result.data contains fresh tradingData.
        if (result.data) {
             setUserInventory(result.data.craftUserAmounts as unknown as UserInventoryItem[]);
        }
      } else {
        const errorMsg = Array.isArray(result.error) ? result.error.join(", ") : result.error;
        setMessage({ type: "error", text: errorMsg || "Crafting failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsTransacting(false);
    }
  };

  const getOwnedAmount = (craftItemId: string) => {
      const item = userInventory.find(i => i.craftItemId === craftItemId);
      return item ? item.amount.toString() : "0";
  };

  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-amber-600 p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-amber-500 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <MapIcon className="text-amber-500" /> FORBIDDEN MAP
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> CRAFTER
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search Crafter..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-amber-500 outline-none transition-all"
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
                <Loader2 className="animate-spin text-amber-500" size={20} />
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
                  }}
                >
                  <span className="text-white font-medium">{u.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">ID: ...{u.id.slice(-4)}</span>
                </div>
              ))}
            </div>
          )}

           {selectedUser && (
            <div className="bg-green-900/30 border border-green-500/50 p-2 rounded flex items-center justify-between text-green-300 text-sm">
              <div className="flex items-center gap-2">
                  <CheckCircle size={16} /> Selected: <span className="font-bold">{selectedUser.name}</span>
              </div>
              {isLoadingInventory && <Loader2 size={14} className="animate-spin" />}
            </div>
           )}
        </div>

        {/* 2. COST INT */}
        <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Coins size={16} /> COST (ETERNITES)
            </label>
            <input 
                type="number"
                min="0"
                className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-amber-500 outline-none"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
            />
        </div>

        {/* 3. RECIPE CREATOR */}
        <div className="flex flex-col gap-2 flex-grow h-auto">
            <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Hammer size={16} /> RECIPE MATERIALS (Select Items)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1">
                {craftItems.map((item) => {
                    const isSelected = !!selectedItems[item.id];
                    const owned = getOwnedAmount(item.id);
                    return (
                        <div 
                            key={item.id}
                            className={`p-3 rounded border transition-all ${
                                isSelected 
                                ? "bg-amber-900/40 border-amber-500" 
                                : "bg-gray-800 border-gray-700 hover:border-gray-500"
                            }`}
                        >
                            <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleItem(item.id)}>
                                <span className={`font-bold ${isSelected ? "text-amber-200" : "text-gray-300"}`}>{item.name}</span>
                                <div className="text-xs text-gray-400 flex flex-col items-end">
                                    <span>Owned</span>
                                    <span className={`font-mono ${parseInt(owned) > 0 ? "text-white" : "text-red-400"}`}>{owned}</span>
                                </div>
                            </div>
                            
                            {isSelected && (
                                <div className="flex items-center gap-2 mt-2 bg-black/20 p-1 rounded">
                                    <button 
                                        className="p-1 hover:bg-white/10 rounded"
                                        onClick={() => updateItemAmount(item.id, selectedItems[item.id] - 1)}
                                    >
                                        <Minus size={14} className="text-gray-400" />
                                    </button>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-center text-sm font-bold text-white outline-none"
                                        value={selectedItems[item.id]}
                                        onChange={(e) => updateItemAmount(item.id, parseInt(e.target.value) || 0)}
                                    />
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
            </div>
        </div>

        {/* 4. QUANTITY */}
         <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold">MAP OUTPUT QUANTITY</label>
             <input 
                type="number" 
                min="1"
                className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-amber-500 outline-none font-bold text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
             />
         </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleCraft}
          disabled={!selectedUser || Object.keys(selectedItems).length === 0 || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || Object.keys(selectedItems).length === 0 || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#AE00DE] to-[#7116C9] text-white hover:scale-[1.02] hover:shadow-[#AE00DE]/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> CRAFTING...
            </>
          ) : (
            <>
              <MapIcon size={20} /> CRAFT FORBIDDEN MAP
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
      <div className="hidden md:flex flex-col gap-6 text-white sticky top-4 h-fit">
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-amber-500/30">
            <h3 className="text-xl font-impact text-gray-300 mb-4">RECIPE SUMMARY</h3>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                    <span className="text-gray-400 text-sm">CRAFTER</span>
                    <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                    <span className="text-gray-400 text-sm flex items-center gap-2"><Coins size={14}/> COST</span>
                    <span className="font-bold text-lg text-red-300">- {cost} Eternites</span>
                </div>

                <div className="bg-black/30 p-4 rounded border border-amber-500/30">
                    <div className="text-xs text-gray-400 mb-2 font-bold uppercase border-b border-gray-700 pb-1">Materials Required</div>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {Object.entries(selectedItems).length === 0 ? (
                            <div className="text-gray-500 italic text-sm">No items selected</div> 
                        ) : (
                            Object.entries(selectedItems).map(([id, qty]) => {
                                const item = craftItems.find(i => i.id === id);
                                const totalReq = qty * parseInt(amount || "0");
                                const owned = parseInt(getOwnedAmount(id));
                                const hasEnough = owned >= totalReq;
                                
                                return (
                                    <div key={id} className="flex justify-between text-sm items-center">
                                        <span className="text-gray-300">{item?.name || id}</span>
                                        <div className="text-right">
                                            <div className="font-bold text-amber-400">{qty} x {amount} = {totalReq}</div>
                                            {!hasEnough && <div className="text-xs text-red-500 font-bold">Insufficient (Has: {owned})</div>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-green-500/30">
                    <span className="text-gray-400 text-sm">OUTPUT</span>
                    <span className="font-bold text-2xl text-green-400">+ {amount} MAP</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
