'use client'
import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers, getUserCraftInventory } from "@/features/trading/services/shop";
import { craftToMap } from "@/features/trading/services/map";
import { Loader2, CheckCircle, AlertCircle, User, Map as MapIcon, Hammer, ArrowRight, Coins } from "lucide-react";

// Local type definitions to match serialized data from server
interface RecipeComponent {
    id: string;
    amount: string | number; 
    craftItem: {
        id: string;
        name: string;
    }
}

interface MapRecipe {
    id: string;
    name?: string | null;
    mapRecipeComponents: RecipeComponent[];
}

interface MapCraftRecipeInterfaceProps {
    mapRecipes: MapRecipe[];
}

export default function MapCraftRecipeInterface({ mapRecipes }: MapCraftRecipeInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  const [cost, setCost] = useState<string>(""); // No default cost, forces user input
  const [userInventory, setUserInventory] = useState<{craftItemId: string, amount: number, name: string}[]>([]);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedRecipe = mapRecipes.find(r => r.id === selectedRecipeId);

  // Auto-select first recipe on load
  useEffect(() => {
    if (mapRecipes.length > 0 && !selectedRecipeId) {
        setSelectedRecipeId(mapRecipes[0].id);
    }
  }, [mapRecipes, selectedRecipeId]);

  // Helper to generate a name for the recipe if missing
  const getRecipeName = (r: MapRecipe) => {
      if (r.name) return r.name;
      const components = r.mapRecipeComponents.map(c => `${c.amount}x ${c.craftItem.name}`).join(", ");
      return `Recipe: ${components}`;
  };

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

  // Fetch inventory when user selected
  useEffect(() => {
      if (selectedUser) {
          getUserCraftInventory(selectedUser.id).then(setUserInventory).catch(console.error);
      } else {
          setUserInventory([]);
      }
  }, [selectedUser]);

  const handleCraft = async () => {
    if (!selectedUser || !selectedRecipe) return;

    const qty = parseInt(amount);
    const costVal = parseInt(cost);

    if (isNaN(qty) || qty <= 0) {
         setMessage({ type: "error", text: "Invalid amount." });
         return;
    }
    
    if (isNaN(costVal) || costVal < 0) {
        setMessage({ type: "error", text: "Invalid cost value." });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await craftToMap(selectedUser.id, selectedRecipe.id, qty, costVal);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully crafted map!" });
        // Refresh inventory
        getUserCraftInventory(selectedUser.id).then(setUserInventory).catch(console.error);
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

  const checkInventory = (recipe: MapRecipe, qty: number) => {
      let enough = true;
      const details = recipe.mapRecipeComponents.map(comp => {
          const required = BigInt(Math.floor(typeof comp.amount === 'string' ? parseFloat(comp.amount) : comp.amount)) * BigInt(qty);
          const inInventory = userInventory.find(i => i.craftItemId === comp.craftItem.id)?.amount || 0;
          const isEnough = BigInt(inInventory) >= required;
          if (!isEnough) enough = false;
          return { ...comp, required, inInventory, isEnough };
      });
      return { enough, details };
  };

  const qtyInt = parseInt(amount) || 0;
  
  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4 mt-8 bg-gray-900/50 rounded-xl border border-purple-500/30">
        <div className="md:col-span-2 text-center border-b border-purple-500/30 pb-4">
             <h2 className="text-3xl font-impact text-purple-400 tracking-wider flex items-center justify-center gap-2">
                <MapIcon className="text-purple-400" /> CRAFT MAP FROM RECIPE
            </h2>
        </div>

      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-purple-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl shadow-purple-900/20">
        
        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> TARGET USER
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search User..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-purple-400 outline-none transition-all"
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
                <Loader2 className="animate-spin text-purple-400" size={20} />
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
            <div className="p-2 rounded flex flex-col gap-1 border bg-purple-900/30 border-purple-500/50">
                <div className="flex items-center gap-2 text-sm text-purple-300">
                    <CheckCircle size={16} /> Selected: <span className="font-bold">{selectedUser.name}</span>
                </div>
            </div>
           )}
        </div>

        {/* 2. COST INPUT */}
        <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                 <Coins size={16} /> CRAFT COST (ETERNITES)
             </label>
             <input 
                type="number" 
                min="0"
                placeholder="Enter cost..." // Placeholder since no default
                className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-purple-400 outline-none"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
             />
         </div>

        {/* 3. AMOUNT INPUT */}
         <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold">QUANTITY OF MAPS</label>
             <input 
                type="number" 
                min="1"
                className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-purple-400 outline-none font-mono text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
             />
         </div>

        {/* 4. RECIPE SELECTION: CARD STYLE */}
        <div className="flex flex-col gap-2">
             <label className="text-gray-400 text-sm font-bold">
                RECIPE
             </label>
             <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                 {mapRecipes.map(r => {
                     const isSelected = selectedRecipeId === r.id;
                     const validation = checkInventory(r, qtyInt);
                     const isEnough = !selectedUser || validation.enough; // Only fail if user selected AND not enough

                     return (
                         <div 
                            key={r.id} 
                            onClick={() => setSelectedRecipeId(r.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 relative group items-start text-left ${
                                isSelected 
                                    ? "bg-purple-900/40 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                                    : "bg-gray-800 border-gray-700 hover:border-gray-500"
                            }`}
                         >
                             <div className="flex justify-between w-full items-center">
                                 <h4 className={`font-bold uppercase text-sm ${isSelected ? "text-purple-300" : "text-gray-300"}`}>
                                     {getRecipeName(r)}
                                 </h4>
                                 {isSelected && <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_5px_#a855f7]"></div>}
                             </div>

                             <div className="flex flex-wrap gap-2 mt-1 w-full">
                                 {validation.details.map((d, idx) => (
                                     <div key={idx} className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${
                                         selectedUser
                                            ? (d.isEnough 
                                                ? "bg-green-900/30 border-green-500/30 text-green-300" 
                                                : "bg-red-900/30 border-red-500/50 text-red-300")
                                            : "bg-gray-900 border-gray-700 text-gray-400"
                                     }`}>
                                         <span>{d.craftItem.name}:</span>
                                         <span className="font-mono">{d.required.toString()}</span>
                                         {selectedUser && (
                                            <>
                                                <span className="text-gray-500 mx-1">/</span>
                                                <span className={d.isEnough ? "text-green-400" : "text-red-400"}>
                                                    {d.inInventory.toString()}
                                                </span>
                                            </>
                                         )}
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )
                 })}
             </div>
         </div>


        {/* ACTION BUTTON */}
        <button
          onClick={handleCraft}
          disabled={!selectedUser || !selectedRecipeId || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || !selectedRecipeId || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:scale-[1.02] hover:shadow-purple-500/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> CRAFTING...
            </>
          ) : (
            <>
              <Hammer size={20} /> CRAFT MAP
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
      <div className="hidden md:flex flex-col justify-start gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-full">
        <h3 className="text-xl font-impact text-gray-300 border-b border-gray-700 pb-2">PREVIEW & STATUS</h3>
        
        {selectedRecipe ? (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-purple-400">{getRecipeName(selectedRecipe)}</span>
                    <span className="text-sm bg-purple-900/50 px-2 py-1 rounded border border-purple-500/30">
                        x{amount} Maps
                    </span>
                </div>
                
                {/* Cost Preview */}
                <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded">
                    <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Coins size={14}/> Cost
                    </span>
                    <span className="font-bold text-red-300">- {cost || 0} Eternites</span>
                </div>

                <div className="p-4 bg-gray-800 rounded border border-gray-700">
                    <h4 className="text-sm font-bold text-gray-400 mb-3 border-b border-gray-700 pb-1">RESOURCE CHECK</h4>
                    <div className="space-y-3">
                        {checkInventory(selectedRecipe, qtyInt).details.map((comp, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-300">{comp.craftItem.name}</span>
                                <div className="flex items-center gap-2">
                                     <span className="font-mono text-gray-400">Req: {comp.required.toString()}</span>
                                     <ArrowRight size={12} className="text-gray-600" />
                                     {selectedUser ? (
                                         <span className={`font-mono font-bold ${comp.isEnough ? "text-green-400" : "text-red-400"}`}>
                                             Have: {comp.inInventory.toString()}
                                         </span>
                                     ) : (
                                         <span className="text-gray-600 italic">Select User</span>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedUser ? (
                     <div className={`mt-2 p-3 rounded border text-sm flex items-center gap-2 ${
                         checkInventory(selectedRecipe, qtyInt).enough
                            ? "bg-green-900/20 border-green-500/30 text-green-300"
                            : "bg-red-900/20 border-red-500/30 text-red-300"
                     }`}>
                         {checkInventory(selectedRecipe, qtyInt).enough 
                            ? <><CheckCircle size={16}/> Resources Available</>
                            : <><AlertCircle size={16}/> Insufficient Resources</>
                         }
                     </div>
                ) : (
                    <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-sm text-yellow-200/80 italic">
                        Select a user to check inventory levels.
                    </div>
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 italic">
                Select a recipe to view requirements
            </div>
        )}
      </div>
    </div>
  );
}
