"use client";

import { useState, useEffect, useRef } from "react";
import { Hammer, ShoppingCart, ChevronDown, Package } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  rallyData?: {
    enonix: number;
    vault: number;
  };
}

interface SmallItem {
  id: string;
  name: string;
  price: number;
}

interface BigItem {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  result_item_id: string;
  small_item_id: string;
  quantity: number;
  smallItem: {
    name: string;
  };
}

interface CraftMaterialPanelProps {
  users?: User[];
  smallItems: SmallItem[];
  bigItems: BigItem[];
  bigItemsRecipe: Recipe[];
  onBuyMaterial: (userId: string, itemId: string) => Promise<{ success: boolean; error?: string }>;
  onCraftBigItem: (userId: string, recipeId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CraftMaterialPanel({
  users = [],
  smallItems = [],
  bigItems = [],
  bigItemsRecipe = [],
  onBuyMaterial,
  onCraftBigItem,
}: CraftMaterialPanelProps) {
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalUsers(users);
    if (selectedUser) {
      const updated = users.find(u => u.id === selectedUser.id);
      if (updated) setSelectedUser(updated);
    }
  }, [users, selectedUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = localUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDropdown(false);
    setSearchQuery("");
    setError(null);
    setSuccess("");
  };

  const handleAction = async (actionName: string, itemName: string, id: string, actionFn: (uid: string, itemId: string) => Promise<{ success: boolean; error?: string }>, isPurchase: boolean) => {
    if (!selectedUser) return;

    const confirmAction = window.confirm(`Apakah Anda yakin ingin melakukan ${actionName} untuk ${itemName}?`);
    if (!confirmAction) return;

    setIsLoading(id);
    setError(null);
    setSuccess("");

    try {
      const res = await actionFn(selectedUser.id, id);
      
      if (res.success) {
        setSuccess(`${actionName} ${itemName} Berhasil!`);
        
        if (isPurchase) {
          const newEnonix = Math.max(0, (selectedUser.rallyData?.enonix || 0) - 5);
          
          const updatedUsers = localUsers.map(u => 
            u.id === selectedUser.id 
              ? { ...u, rallyData: { ...u.rallyData!, enonix: newEnonix } } 
              : u
          );
          setLocalUsers(updatedUsers);

          setSelectedUser(prev => prev ? {
            ...prev,
            rallyData: { ...prev.rallyData!, enonix: newEnonix }
          } : null);
        }
      } else {
        setError(res.error || `Gagal melakukan ${actionName}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl border-3 border-[#684095] shadow-2xl p-6">
      <h2 className="text-3xl font-impact text-[#78CCEE] mb-6 text-center uppercase tracking-wider">
        CRAFT & MATERIAL
      </h2>

      <div className="mb-6 relative" ref={dropdownRef}>
        <label className="block text-[#78CCEE] font-bold mb-2 uppercase text-xs tracking-widest">
          Search Participant
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowUserDropdown(true)}
            placeholder="Type name..."
            className="w-full bg-[#3E344A] text-white px-4 py-3 rounded-lg border-2 border-[#684095] focus:border-[#78CCEE] outline-none transition-colors pr-10"
          />
          <ChevronDown 
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#78CCEE] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
            size={20}
          />
        </div>

        {showUserDropdown && filteredUsers.length > 0 && (
          <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-[#3E344A] rounded-lg border-2 border-[#684095] shadow-xl">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full p-3 hover:bg-[#78CCEE]/20 transition-all text-left border-b border-[#684095]/30 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase">ID: {user.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#41FFA3] text-xs font-bold uppercase tracking-tighter">Eonix: {user.rallyData?.enonix || 0}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="w-full p-4 bg-[#3E344A] border-2 border-[#78CCEE] rounded-xl mb-6 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <div>
            <p className="text-[#78CCEE] text-[10px] font-bold uppercase tracking-[0.2em]">Target Participant:</p>
            <p className="text-white text-xl font-impact uppercase tracking-wider">
              {selectedUser.name}
            </p>
          </div>
          <div className="text-right bg-black/20 p-2 rounded-lg border border-white/5">
             <p className="text-slate-400 text-[9px] uppercase font-bold">Current Eonix</p>
             <p className="text-[#41FFA3] text-2xl font-impact leading-none">{selectedUser.rallyData?.enonix || 0}</p>
          </div>
        </div>
      )}

      {selectedUser ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-[#41FFA3] font-impact text-lg flex items-center gap-2 border-b border-[#684095] pb-2 tracking-widest uppercase">
              <ShoppingCart size={18} /> Beli Material
            </h3>
            <div className="space-y-2">
              {smallItems.map((item) => (
                <div key={item.id} className="bg-[#3E344A] border-2 border-[#684095] p-3 rounded-xl flex justify-between items-center hover:border-[#41FFA3]/50 transition-colors">
                  <span className="text-white font-bold text-sm uppercase tracking-tight">{item.name}</span>
                  <button
                    disabled={isLoading !== null || (selectedUser.rallyData?.enonix || 0) < item.price}
                    onClick={() => handleAction("Pembelian", item.name, item.id, onBuyMaterial, true)}
                    className="bg-[#41FFA3] hover:bg-[#2ee089] text-[#3E344A] font-impact px-4 py-2 rounded-lg text-xs transition-all active:scale-95 disabled:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-green-500/10"
                  >
                    {isLoading === item.id ? "..." : "BUY"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#78CCEE] font-impact text-lg flex items-center gap-2 border-b border-[#684095] pb-2 tracking-widest uppercase">
              <Hammer size={18} /> Craft Big Item
            </h3>
            <div className="space-y-3">
              {bigItems.map((item) => {
                const recipes = bigItemsRecipe.filter(r => r.result_item_id === item.id);
                const firstRecipe = recipes[0]; 

                return (
                  <div key={item.id} className="bg-[#3E344A] border-2 border-[#684095] p-3 rounded-xl hover:border-[#78CCEE]/50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-bold text-sm uppercase tracking-tight">{item.name}</span>
                      <button
                        disabled={isLoading !== null || !firstRecipe}
                        onClick={() => firstRecipe && handleAction("Crafting", item.name, firstRecipe.id, onCraftBigItem, false)}
                        className="bg-[#78CCEE] hover:bg-[#5bb8e0] text-[#3E344A] font-impact px-4 py-2 rounded-lg text-xs transition-all active:scale-95 disabled:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#78CCEE]/10"
                      >
                        {isLoading === (firstRecipe?.id || item.id) ? "..." : "CRAFT"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recipes.length > 0 ? recipes.map(r => (
                        <span key={r.id} className="text-[9px] bg-black/40 text-slate-300 px-2 py-1 rounded-md border border-[#684095] font-bold">
                          {r.quantity}X {r.smallItem.name.toUpperCase()}
                        </span>
                      )) : (
                        <span className="text-[9px] text-red-400 italic font-bold uppercase">No Recipe Defined</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#3E344A]/30 border-2 border-dashed border-[#684095] rounded-2xl flex flex-col items-center justify-center">
           <Package className="text-[#684095] mb-4 opacity-50" size={64} />
           <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Waiting for selection</p>
        </div>
      )}

      {(error || success) && (
        <div className={`mt-6 p-4 rounded-xl text-center text-xs font-bold border-2 animate-in slide-in-from-bottom-2 ${
          error ? "bg-red-500/10 border-red-500 text-red-400" : "bg-green-500/10 border-green-500 text-green-400"
        }`}>
          {error ? `⚠️ ERROR: ${error.toUpperCase()}` : `✅ SUCCESS: ${success.toUpperCase()}`}
        </div>
      )}
    </div>
  );
}