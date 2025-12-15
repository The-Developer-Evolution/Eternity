"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { buyItemBM, BlackMarketItemDetail } from "@/features/trading/services/blackmarket";
import { Loader2, CheckCircle, AlertCircle, User, ShoppingCart, Package } from "lucide-react";

interface BlackMarketInterfaceProps {
    items: BlackMarketItemDetail[];
}

export default function BlackMarketInterface({ items }: BlackMarketInterfaceProps) {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [selectedItem, setSelectedItem] = useState<BlackMarketItemDetail | null>(null);
  const [amount, setAmount] = useState<string>("1");
  
  const [isSearching, setIsSearching] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const rawItems = items.filter(i => i.type === 'RAW');
  const craftItems = items.filter(i => i.type === 'CRAFT');

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

  const handleBuy = async () => {
    if (!selectedUser || !selectedItem) return;

    const qty = parseInt(amount);
    if (isNaN(qty) || qty <= 0) {
        setMessage({ type: "error", text: "Invalid amount." });
        return;
    }

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await buyItemBM(selectedUser.id, selectedItem.id, qty, selectedItem.type);
      
      if (result.success) {
        setMessage({ type: "success", text: result.message || "Purchase successful!" });
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
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {rawItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            disabled={item.stock <= 0}
                            className={`p-3 rounded text-sm flex justify-between items-center transition-all border ${
                                selectedItem?.id === item.id 
                                ? "bg-red-900/60 border-red-500 text-white" 
                                : item.stock <= 0
                                    ? "bg-gray-800/50 text-gray-600 border-transparent cursor-not-allowed"
                                    : "bg-gray-800 text-gray-300 border-gray-600 hover:border-red-500"
                            }`}
                        >
                            <span className="font-bold">{item.name}</span>
                            <div className="flex flex-col items-end text-xs">
                                <span className={item.stock > 0 ? "text-green-400" : "text-red-400"}>Stock: {item.stock}</span>
                                <span className="text-yellow-500 font-mono">{item.price.toLocaleString("en-US")} E</span>
                            </div>
                        </button>
                    ))}
                    {rawItems.length === 0 && <div className="text-gray-500 italic text-sm">No raw items available.</div>}
                </div>
            </div>

            {/* CRAFT ITEMS */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
                    <Package size={16} /> CRAFT ITEMS
                </label>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {craftItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                             disabled={item.stock <= 0}
                            className={`p-3 rounded text-sm flex justify-between items-center transition-all border ${
                                selectedItem?.id === item.id 
                                ? "bg-purple-900/60 border-purple-500 text-white" 
                                : item.stock <= 0
                                    ? "bg-gray-800/50 text-gray-600 border-transparent cursor-not-allowed"
                                    : "bg-gray-800 text-gray-300 border-gray-600 hover:border-purple-500"
                            }`}
                        >
                            <span className="font-bold">{item.name}</span>
                           <div className="flex flex-col items-end text-xs">
                                <span className={item.stock > 0 ? "text-green-400" : "text-red-400"}>Stock: {item.stock}</span>
                                <span className="text-yellow-500 font-mono">{item.price.toLocaleString("en-US")} E</span>
                            </div>
                        </button>
                    ))}
                    {craftItems.length === 0 && <div className="text-gray-500 italic text-sm">No craft items available.</div>}
                </div>
            </div>
        </div>

        {/* 3. QUANTITY & BUY */}
        <div className="flex items-end gap-4">
             <div className="flex flex-col gap-2 flex-grow">
                 <label className="text-gray-400 text-sm font-bold">QUANTITY</label>
                 <input 
                    type="number" 
                    min="1"
                    className="bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-red-500 outline-none w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                 />
             </div>
             
             <button
                onClick={handleBuy}
                disabled={!selectedUser || !selectedItem || isTransacting}
                className={`py-3 px-8 rounded font-impact tracking-wider text-xl transition-all shadow-lg hidden md:flex items-center justify-center gap-2 h-[50px] ${
                    !selectedUser || !selectedItem || isTransacting
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
            >
                 {isTransacting ? <Loader2 className="animate-spin" /> : <ShoppingCart size={20} />} BUY
            </button>
        </div>
        
         <button
            onClick={handleBuy}
            disabled={!selectedUser || !selectedItem || isTransacting}
            className={`w-full py-4 rounded font-impact tracking-wider text-xl transition-all shadow-lg md:hidden flex items-center justify-center gap-2 ${
                !selectedUser || !selectedItem || isTransacting
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-500"
            }`}
        >
                {isTransacting ? <Loader2 className="animate-spin" /> : <ShoppingCart size={20} />} BUY NOW
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
      <div className="md:col-span-1 flex flex-col gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-fit sticky top-4">
        <h3 className="text-xl font-impact text-gray-300">RECEIPT</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">BUYER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">ITEM</span>
                <span className="font-bold text-lg text-red-400 text-right">{selectedItem?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">UNIT PRICE</span>
                <span className="font-mono text-yellow-500">{selectedItem ? selectedItem.price.toLocaleString("en-US") + " E" : "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">TOTAL</span>
                 <span className="font-mono text-xl font-bold text-red-400">
                    {selectedItem && !isNaN(parseInt(amount)) 
                        ? (selectedItem.price * parseInt(amount)).toLocaleString("en-US") + " E" 
                        : "---"
                    }
                </span>
            </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
            Black Market transactions are final.
        </div>
      </div>
    </div>
  );
}
