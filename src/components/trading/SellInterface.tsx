"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { sellItem } from "@/features/trading/services/sell";
import { Loader2, CheckCircle, AlertCircle, User, Coins, Package, Layers, Map as MapIcon, DollarSign } from "lucide-react";
import { RawItem, CraftItem } from "@/generated/prisma/client";
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
    rawItems: RawItem[];
    craftItems: CraftItem[];
    mapPrice: number;
}

export default function SellInterface({ rawItems, craftItems, mapPrice }: SellInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  const [userInventory, setUserInventory] = useState<InventoryItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<"RAW" | "CRAFT" | "MAP">("RAW");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
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
  

  const handleSell = async () => {
    const period = await getRunningTradingPeriod()
    if (!period) return { success: false, error: "The game is PAUSED" };

    if (!selectedUser || !selectedItem) return;

    const qty = parseInt(amount);
    if (isNaN(qty) || qty <= 0) {
         setMessage({ type: "error", text: "Invalid amount." });
         return;
    }
    
    if (qty > selectedItem.owned) {
        setMessage({ type: "error", text: `You only own ${selectedItem.owned}.` });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await sellItem(selectedUser.id, selectedItem.type, selectedItem.id === 'MAP' ? null : selectedItem.id, qty);
      
      if (result.success && result.data) {
        setMessage({ type: "success", text: result.message || "Sold successfully!" });
        // Update local inventory from result
        const tradingData = result.data as unknown as AllTradingData;
        // Re-construct inventory
        // This logic mimics the "Load" logic I need to implement.
        // I will extract this mapping logic.
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
        // Deselect item if sold out? No, keep selected.
        const updatedItem = newInv.find(i => i.id === selectedItem.id && i.type === selectedItem.type);
        if (updatedItem) setSelectedItem(updatedItem);

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
  const filteredItems = userInventory.filter(i => i.type === activeTab);

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
                    // Trigger inventory load (Simulated via server action in future step)
                    // For now, I'll need a way to get data. 
                    // I will leave this hook empty and implement the fetcher in next step.
                    // See `fetchInventory` placeholder.
                    // Actually, I will call a prop function or action.
                    // Let's assume `getUserInventory` is imported.
                    const { getUserInventory } = await import('@/features/trading/services/sell');
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

      {/* MIDDLE: ITEM SELECTION */}
      <div className="col-span-1 md:col-span-2 bg-gray-900/80 backdrop-blur-md border border-cyan-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl min-h-[500px]">
         <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h2 className="text-xl font-impact text-cyan-400 tracking-wider flex items-center gap-2">
                 <Package className="text-cyan-400" /> INVENTORY
            </h2>
            <div className="flex gap-2">
                {(['RAW', 'CRAFT', 'MAP'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => { setActiveTab(type); setSelectedItem(null); setAmount("1"); }}
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
            {filteredItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setAmount("1"); }}
                    disabled={item.owned <= 0}
                    className={`p-3 rounded-lg border flex flex-col justify-between h-[100px] transition-all relative overflow-hidden ${
                        selectedItem?.id === item.id && selectedItem?.type === item.type
                         ? "bg-cyan-900/60 border-cyan-400"
                         : item.owned > 0 
                            ? "bg-gray-800 border-gray-600 hover:border-cyan-400 group" 
                            : "bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed"
                    }`}
                >
                    <div className="flex justify-between items-start w-full">
                        <span className={`text-sm font-bold truncate ${selectedItem?.id === item.id ? "text-white" : "text-gray-300"}`}>{item.name}</span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                         <span className={`text-xs ${item.currency === 'IDR' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {item.price.toLocaleString()} {item.currency === 'IDR' ? 'IDR' : 'ET'}
                        </span>
                        <span className={`text-lg font-bold ${item.owned > 0 ? "text-cyan-400" : "text-gray-600"}`}>
                            x{item.owned}
                        </span>
                    </div>
                </button>
            ))}
            {filteredItems.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10 italic">No items found for this category.</div>
            )}
         </div>

         {/* SELL ACTION AREA */}
         <div className="mt-auto border-t border-gray-700 pt-4 flex flex-col md:flex-row gap-4 items-end justify-between">
            
            {/* INPUT */}
            <div className="flex gap-4 w-full md:w-auto items-center">
                 <div className="flex flex-col gap-1 w-full">
                    <label className="text-gray-400 text-xs font-bold">AMOUNT TO SELL</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            min="1"
                            max={selectedItem?.owned || 1}
                            className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-24 text-center focus:border-cyan-400 outline-none"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                         <button 
                            onClick={() => setAmount(String(selectedItem?.owned || 1))}
                            disabled={!selectedItem}
                            className="bg-gray-700 hover:bg-gray-600 text-xs px-3 rounded text-white"
                        >
                            MAX
                        </button>
                    </div>
                 </div>
            </div>

            {/* SUMMARY & BUTTON */}
            <div className="flex gap-4 items-center w-full md:w-auto">
                {selectedItem && !isNaN(parseInt(amount)) && (
                    <div className="text-right">
                        <div className="text-gray-400 text-xs">TOTAL EARNINGS</div>
                        <div className={`text-xl font-bold ${selectedItem.currency === 'IDR' ? 'text-green-400' : 'text-yellow-400'}`}>
                             {(selectedItem.price * parseInt(amount)).toLocaleString()} {selectedItem.currency === 'IDR' ? 'IDR' : 'ET'}
                        </div>
                    </div>
                )}
                
                <button
                onClick={handleSell}
                disabled={!selectedUser || !selectedItem || isTransacting || parseInt(amount) > (selectedItem?.owned || 0)}
                className={`px-8 py-3 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center gap-2 ${
                    !selectedUser || !selectedItem || isTransacting || parseInt(amount) > (selectedItem?.owned || 0)
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:scale-[1.02] hover:shadow-green-500/50"
                }`}
                >
                {isTransacting ? <Loader2 className="animate-spin" /> : <DollarSign />} 
                SELL
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
