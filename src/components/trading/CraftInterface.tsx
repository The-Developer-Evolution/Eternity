"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { itemToCraft, CraftRecipeDetail } from "@/features/trading/services/craft";
import { Loader2, CheckCircle, AlertCircle, User, Hammer, Package } from "lucide-react";

interface CraftInterfaceProps {
    recipes: CraftRecipeDetail[];
}

export default function CraftInterface({ recipes }: CraftInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [selectedCraftItem, setSelectedCraftItem] = useState<CraftRecipeDetail | null>(null);
  
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

  const handleCraft = async () => {
    if (!selectedUser || !selectedCraftItem) return;

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await itemToCraft(selectedUser.id, selectedCraftItem.id);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Crafting successful!" });
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

  return (
    <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-[#F0A500] p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-[#F0A500] tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <Hammer className="text-[#F0A500]" /> MATERIAL CONVERSION
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
        <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Package size={16} /> SELECT ITEM TO CRAFT
            </label>
            <div className="grid grid-cols-2 gap-2">
                {recipes.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedCraftItem(item)}
                        className={`p-3 rounded text-sm font-bold transition-all border ${
                            selectedCraftItem?.id === item.id 
                            ? "bg-[#F0A500] text-black border-[#F0A500]" 
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:border-[#F0A500]"
                        }`}
                    >
                        {item.name}
                    </button>
                ))}
            </div>
        </div>

        {/* 3. RECIPE DISPLAY */}
        {selectedCraftItem && (
             <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-2">
                <div className="text-[#F0A500] font-bold text-sm">RECIPE REQUIREMENTS</div>
                <div className="flex flex-col gap-1">
                    {selectedCraftItem.recipes.map((req, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-300">{req.rawItemName}</span>
                            <span className="text-white font-mono font-bold">x{req.amount}</span>
                        </div>
                    ))}
                    {selectedCraftItem.recipes.length === 0 && (
                        <div className="text-red-400 text-xs">No recipe defined.</div>
                    )}
                </div>
             </div>
        )}

        {/* ACTION BUTTON */}
        <button
          onClick={handleCraft}
          disabled={!selectedUser || !selectedCraftItem || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || !selectedCraftItem || isTransacting
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
              <Hammer size={20} /> CRAFT ITEM
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
        <h3 className="text-xl font-impact text-gray-300">CONVERSION PREVIEW</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">CRAFTER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">OUTPUT</span>
                <span className={`font-bold text-lg uppercase ${selectedCraftItem ? "text-[#F0A500]" : "text-gray-500"}`}>
                    {selectedCraftItem?.name || "---"}
                </span>
            </div>
            
             <div className="flex flex-col bg-gray-800/80 p-4 rounded border border-[#F0A500]/30 min-h-[100px] justify-center">
                <span className="text-gray-400 text-sm mb-2">INPUTS CONSUMED</span>
                {selectedCraftItem ? (
                     <div className="flex flex-wrap gap-2">
                        {selectedCraftItem.recipes.map((req, idx) => (
                             <span key={idx} className="bg-red-900/40 text-red-200 px-2 py-1 rounded text-xs border border-red-500/30">
                                -{req.amount} {req.rawItemName}
                             </span>
                        ))}
                     </div>
                ) : (
                    <div className="text-gray-600 text-center italic">Select an item to see requirements</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
