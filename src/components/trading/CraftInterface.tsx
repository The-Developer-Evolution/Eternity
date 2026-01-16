"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { CraftRecipeDetail, craftBulkItems } from "@/features/trading/services/craft";
import { Loader2, CheckCircle, AlertCircle, User, Hammer, Package, Plus, Minus, Coins } from "lucide-react";

interface CraftInterfaceProps {
    recipes: CraftRecipeDetail[];
}

export default function CraftInterface({ recipes }: CraftInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  // Bulk selection: Map<craftItemId, amount>
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [customCost, setCustomCost] = useState<string>("500");
  
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

  const toggleItem = (item: CraftRecipeDetail) => {
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

  const handleCraft = async () => {
    if (!selectedUser) return;

    const itemsToCraft = Object.entries(selectedItems)
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => ({ id, amount }));
    
    if (itemsToCraft.length === 0) {
        setMessage({ type: "error", text: "Please select at least one item to craft." });
        return;
    }

    const costVal = parseInt(customCost);
    if (isNaN(costVal) || costVal < 0) {
        setMessage({ type: "error", text: "Invalid cost value." });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await craftBulkItems(selectedUser.id, itemsToCraft, costVal);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Crafting successful!" });
        setSelectedItems({}); // Clear selection
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

  // Calculate Materials Consumed Summary
  const materialsSummary: Record<string, number> = {};
  Object.entries(selectedItems).forEach(([id, amount]) => {
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
          recipe.recipes.forEach(req => {
              materialsSummary[req.rawItemName] = (materialsSummary[req.rawItemName] || 0) + (req.amount * amount);
          });
      }
  });

  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-[#F0A500] p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-[#F0A500] tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <Hammer className="text-[#F0A500]" /> CRAFT ITEM
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> CRAFTER
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search User..."
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

        {/* 2. SELECT CRAFT ITEM */}
        <div className="flex flex-col gap-2 flex-grow">
             <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Package size={16} /> SELECT ITEMS TO CRAFT
            </label>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[400px] pr-1">
                {recipes.map((item) => {
                    const isSelected = !!selectedItems[item.id];
                    return (
                        <div
                            key={item.id}
                            className={`p-3 rounded border transition-all relative overflow-hidden group flex flex-col justify-between ${
                                isSelected 
                                ? "bg-[#F0A500]/20 border-[#F0A500]" 
                                : "bg-gray-800 border-gray-600 hover:border-[#F0A500]"
                            }`}
                        >
                            <div className="cursor-pointer" onClick={() => toggleItem(item)}>
                                <div className={`font-bold text-sm uppercase ${isSelected ? "text-white" : "text-gray-300"}`}>{item.name}</div>
                            </div>
                             
                             {isSelected ? (
                                <div className="flex items-center gap-2 mt-2 bg-black/40 p-1 rounded justify-between">
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
                            ) : (
                                <div className="mt-2 h-7" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 3. TRANSACTION COST */}
        <div className="flex flex-col gap-2">
           <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Coins size={16} /> TRANSACTION COST (ETERNITES)
           </label>
           <input 
                type="number"
                min="0"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-[#F0A500] outline-none"
           />
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleCraft}
          disabled={!selectedUser || Object.keys(selectedItems).length === 0 || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || Object.keys(selectedItems).length === 0 || isTransacting
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
              <Hammer size={20} /> CRAFT ITEMS
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
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-impact text-gray-300 mb-4">CONVERSION PREVIEW</h3>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                    <span className="text-gray-400 text-sm">CRAFTER</span>
                    <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
                </div>

                 <div className="bg-black/30 p-4 rounded border border-[#F0A500]/30 min-h-[100px]">
                    <div className="text-xs text-gray-400 mb-2 font-bold uppercase border-b border-gray-700 pb-1">Planned Output</div>
                    <div className="flex flex-col gap-2">
                        {Object.keys(selectedItems).length === 0 ? (
                            <div className="text-gray-500 italic text-sm">No items selected</div>
                        ) : (
                            Object.entries(selectedItems).map(([id, amount]) => {
                                const item = recipes.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between text-sm items-center">
                                        <span className="text-[#F0A500] font-bold">{item.name}</span>
                                        <span className="font-mono text-white">x {amount}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                
                 <div className="flex flex-col bg-gray-800/80 p-4 rounded border-t-2 border-red-500/50">
                    <span className="text-gray-400 text-sm mb-2 font-bold">RAW MATERIALS REQUIRED</span>
                    {Object.keys(materialsSummary).length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                            {Object.entries(materialsSummary).map(([name, amount], idx) => (
                                 <span key={idx} className="bg-red-900/40 text-red-200 px-2 py-1 rounded text-xs border border-red-500/30 flex items-center gap-1">
                                    <span>{name}</span>
                                    <span className="font-bold font-mono">x{amount}</span>
                                 </span>
                            ))}
                         </div>
                    ) : (
                        <div className="text-gray-600 italic text-xs">None</div>
                    )}
                </div>

                <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                    <span className="text-gray-400 text-sm">FEE</span>
                    <span className="font-bold text-lg font-mono text-red-300">-{customCost || 0} E</span>
                </div>
            </div>
            
             <div className="mt-8 text-xs text-gray-500 text-center">
                Processing bulk conversion.<br/>Irreversible action.
            </div>
        </div>
      </div>
    </div>
  );
}
