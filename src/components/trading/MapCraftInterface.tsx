"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { craftToMap } from "@/features/trading/services/map";
import { Loader2, CheckCircle, AlertCircle, User, Map as MapIcon, Hammer } from "lucide-react";

// Types based on what getAllMapRecipes returns
type MapRecipe = {
  id: string;
  mapRecipeComponents: {
    id: string;
    amount: number;
    craftItem: {
      name: string;
    };
  }[];
};

interface MapCraftInterfaceProps {
    recipes: MapRecipe[];
}

export default function MapCraftInterface({ recipes }: MapCraftInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<MapRecipe | null>(null);
  const [amount, setAmount] = useState<string>("1");
  
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
    if (!selectedUser || !selectedRecipe) return;

    const qty = parseInt(amount);
    if (isNaN(qty) || qty <= 0) {
         setMessage({ type: "error", text: "Invalid amount." });
         return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await craftToMap(selectedUser.id, selectedRecipe.id, qty);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Map crafted successfully!" });
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

  return (
    <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-amber-600 p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-amber-500 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <MapIcon className="text-amber-500" /> MAP CREATION
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

        {/* 2. RECIPE SELECTOR */}
        <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                <Hammer size={16} /> MAP RECIPES
            </label>
            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                {recipes.map((recipe) => (
                    <button
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className={`p-4 rounded-lg text-sm text-left transition-all border ${
                            selectedRecipe?.id === recipe.id
                            ? "bg-amber-900/60 border-amber-500 text-white" 
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:border-amber-500"
                        }`}
                    >
                        <div className="font-bold text-amber-100 mb-1">Recipe #{recipe.id.slice(-4)}</div>
                        <div className="flex flex-wrap gap-2">
                            {recipe.mapRecipeComponents.map((comp) => (
                                <span key={comp.id} className="bg-black/40 px-2 py-1 rounded text-xs text-gray-300 border border-gray-700">
                                    {comp.amount}x <span className="text-amber-400">{comp.craftItem.name}</span>
                                </span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>
             {recipes.length === 0 && <div className="text-gray-500 italic text-sm">No map recipes available.</div>}
        </div>

        {/* 3. QUANTITY */}
         <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold">MAP QUANTITY</label>
             <input 
                type="number" 
                min="1"
                className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-amber-500 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
             />
         </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleCraft}
          disabled={!selectedUser || !selectedRecipe || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || !selectedRecipe || isTransacting
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
              <MapIcon size={20} /> CREATE MAP
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
      <div className="hidden md:flex flex-col justify-center gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-amber-500/30 sticky top-4">
        <h3 className="text-xl font-impact text-gray-300">CRAFTING SUMMARY</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">CRAFTER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">OUTPUT</span>
                <span className="font-bold text-lg text-amber-400">MAP</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/80 p-4 rounded border border-amber-500/30">
                <span className="text-gray-400 text-sm">QUANTITY</span>
                <span className="font-bold text-2xl text-green-400">+ {amount}</span>
            </div>
        </div>

        {selectedRecipe && !isNaN(parseInt(amount)) && (
            <div className="bg-black/30 p-4 rounded border border-amber-500/30 mt-4">
                 <div className="text-xs text-gray-400 mb-2 font-bold uppercase">Required Materials</div>
                 <div className="flex flex-col gap-2">
                    {selectedRecipe.mapRecipeComponents.map((comp) => (
                         <div key={comp.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">{comp.craftItem.name}</span>
                            <span className="text-red-400 font-bold">- {comp.amount * parseInt(amount)}</span>
                         </div>
                    ))}
                 </div>
            </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 text-center">
            Materials will be deducted from user inventory. 
            Map count will be updated.
        </div>
      </div>
    </div>
  );
}
