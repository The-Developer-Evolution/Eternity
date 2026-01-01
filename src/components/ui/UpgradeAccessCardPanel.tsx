'use client'

import { useState, useEffect } from "react";
import CardPanel from "@/components/ui/CardPanel";
import { Plus, Minus, Trash2 } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  amount: number;
}

interface User {
  id: string;
  name: string;
  rallyData?: {
    access_card_level: number;
    enonix: number;
  };
  bigItemInventory?: InventoryItem[];
  smallItemInventory?: InventoryItem[];
}

interface UpgradeAccessCardPanelProps {
  users?: User[];
}

interface SelectedItem {
  id: string;
  name: string;
  amount: number;
  type: 'big' | 'small';
}

// Upgrade Requirements Mapping
const UPGRADE_REQUIREMENTS = {
  1: {
    level: "Level 1 → Level 2",
    eonix: 5,
    requirements: [
      "1 Token bebas (Sigil/Chrono/Fragment Token)",
      "1 Material bebas (Shard/Rune/Flux)",
      "Stamp pos sudah bermain di 2 pos bebas"
    ]
  },
  2: {
    level: "Level 2 → Level 3",
    eonix: 8,
    requirements: [
      "2 Token bebas (Sigil/Chrono/Fragment Token)",
      "2 Material bebas (Shard/Rune/Flux)"
    ]
  },
  3: {
    level: "Level 3 → Level 4",
    eonix: 12,
    requirements: [
      "2 Token bebas (Sigil/Chrono/Fragment Token)",
      "3 Material bebas (Shard/Rune/Flux)",
      "Stamp pos di 3 zona berbeda"
    ]
  },
  4: {
    level: "Level 4 → Level 5",
    eonix: 15,
    requirements: [
      "1 Sigil Token + 1 Chrono Token + 1 Fragment Token",
      "3 Material bebas (Shard/Rune/Flux)",
      "Stamp pos di 4 zona berbeda"
    ]
  }
};

export default function UpgradeAccessCardPanel({
  users = []
}: UpgradeAccessCardPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [eonixCost, setEonixCost] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

  // Auto-fill Eonix cost based on user's current level
  useEffect(() => {
    if (selectedUser?.rallyData) {
      const currentLevel = selectedUser.rallyData.access_card_level;
      const requirement = UPGRADE_REQUIREMENTS[currentLevel as keyof typeof UPGRADE_REQUIREMENTS];
      if (requirement) {
        setEonixCost(requirement.eonix);
      }
    }
  }, [selectedUser]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setError(null);
    setSuccess(null);

    if (query.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedItems([]);
    setError(null);
    setSuccess(null);
  };

  const addItem = (item: InventoryItem, type: 'big' | 'small') => {
    const existingItem = selectedItems.find(i => i.id === item.id && i.type === type);
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id && i.type === type
          ? { ...i, amount: i.amount + 1 }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, amount: 1, type }]);
    }
  };

  const updateItemAmount = (id: string, type: 'big' | 'small', newAmount: number) => {
    if (newAmount <= 0) {
      removeItem(id, type);
    } else {
      setSelectedItems(selectedItems.map(i => 
        i.id === id && i.type === type
          ? { ...i, amount: newAmount }
          : i
      ));
    }
  };

  const removeItem = (id: string, type: 'big' | 'small') => {
    setSelectedItems(selectedItems.filter(i => !(i.id === id && i.type === type)));
  };

  const handleUpgrade = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    if (eonixCost <= 0 && selectedItems.length === 0) {
      setError("Please set Eonix cost or select items to use");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const bigItems = selectedItems
        .filter(i => i.type === 'big')
        .map(i => ({ id: i.id, amount: i.amount }));
      
      const smallItems = selectedItems
        .filter(i => i.type === 'small')
        .map(i => ({ id: i.id, amount: i.amount }));

      const response = await fetch("/api/rally/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: selectedUser.id,
          eonixCost,
          bigItems,
          smallItems
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newLevel = data.newLevel;
        setSuccess(`Successfully upgraded ${selectedUser.name} to level ${newLevel}`);

        // Update user in list
        const updatedUsers = allUsers.map(u =>
          u.id === selectedUser.id
            ? { 
                ...u, 
                rallyData: { 
                  ...u.rallyData!, 
                  access_card_level: newLevel,
                  enonix: (u.rallyData?.enonix || 0) - eonixCost
                },
                bigItemInventory: u.bigItemInventory?.map(inv => {
                  const usedItem = bigItems.find(bi => bi.id === inv.id);
                  return usedItem ? { ...inv, amount: inv.amount - usedItem.amount } : inv;
                }),
                smallItemInventory: u.smallItemInventory?.map(inv => {
                  const usedItem = smallItems.find(si => si.id === inv.id);
                  return usedItem ? { ...inv, amount: inv.amount - usedItem.amount } : inv;
                })
              }
            : u
        );
        setAllUsers(updatedUsers);
        setFilteredUsers(updatedUsers);

        // Reset form
        setSelectedUser(null);
        setSearchQuery("");
        setSelectedItems([]);
        setEonixCost(0);

        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Upgrade failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedUser(null);
    setSearchQuery("");
    setFilteredUsers(allUsers);
    setSelectedItems([]);
    setEonixCost(0);
    setError(null);
    setSuccess(null);
  };

  // Get current upgrade requirement info
  const getCurrentRequirement = () => {
    if (!selectedUser?.rallyData) return null;
    const currentLevel = selectedUser.rallyData.access_card_level;
    return UPGRADE_REQUIREMENTS[currentLevel as keyof typeof UPGRADE_REQUIREMENTS];
  };

  const currentRequirement = getCurrentRequirement();

  return (
    <CardPanel title="RALLY GAMES - MANUAL UPGRADE" extraClass="">
      <div className="w-full">
        <label className="block text-white font-bold text-sm mb-2 uppercase tracking-wide">
          Search User
        </label>
        <input
          type="text"
          placeholder="Enter username..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 bg-black/50 border-2 border-[#78CCEE] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#41FFA3] transition-colors"
        />
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="w-full p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="w-full p-4 bg-green-500/20 border-2 border-green-500 rounded-lg text-green-300 text-sm text-center">
          {success}
        </div>
      )}

      {/* User Selection List */}
      <div className="w-full">
        <label className="block text-white font-bold text-sm mb-3 uppercase tracking-wide">
          Select User ({filteredUsers.length})
        </label>

        <div className="max-h-64 overflow-y-auto bg-black/50 border-2 border-[#78CCEE] rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full p-4 text-left border-b border-[#684095]/30 transition-all hover:bg-black/10 ${
                  selectedUser?.id === user.id ? "bg-black/20 border-l-4 border-l-[#78CCEE]" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-sm text-slate-400">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#41FFA3] font-bold">Level {user.rallyData?.access_card_level || 0}</p>
                    <p className="text-xs text-slate-400">{user.rallyData?.enonix || 0} Eonix</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Selected User - Upgrade Configuration */}
      {selectedUser && (
        <div className="w-full space-y-4">
          {/* User Info */}
          <div className="p-4 bg-[#3E344A] border-2 border-[#78CCEE] rounded-lg">
            <p className="text-[#78CCEE] font-bold mb-2">Selected User:</p>
            <p className="text-white text-lg font-semibold">{selectedUser.name}</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-slate-400 text-xs">Current Level</p>
                <p className="text-[#41FFA3] text-2xl font-impact">
                  {selectedUser.rallyData?.access_card_level || 0}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Eonix Balance</p>
                <p className="text-[#78CCEE] text-2xl font-impact">
                  {selectedUser.rallyData?.enonix || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Requirements Display */}
          {currentRequirement && (
            <div className="p-4 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-impact text-xl">{currentRequirement.level}</h3>
                <div className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/50">
                  <span className="text-yellow-300 font-bold text-sm">{currentRequirement.eonix} Eonix</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-purple-300 text-xs font-bold uppercase mb-2">Requirements:</p>
                {currentRequirement.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 text-xs mt-1">•</span>
                    <p className="text-white text-sm">{req}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Max Level Warning */}
          {(selectedUser.rallyData?.access_card_level ?? 0) >= 5 && (
            <div className="p-4 bg-amber-500/20 border-2 border-amber-500 rounded-lg text-center">
              <p className="text-amber-300 font-bold">⚠️ This user is already at MAX LEVEL (5)</p>
            </div>
          )}

          {/* Eonix Cost Input */}
          <div className="p-4 bg-[#3E344A]/80 border-2 border-[#684095] rounded-lg">
            <label className="text-white font-bold text-sm mb-2 block uppercase">
              Eonix Cost 
              {currentRequirement && (
                <span className="text-yellow-300 ml-2">(Recommended: {currentRequirement.eonix})</span>
              )}
            </label>
            <input
              type="number"
              min="0"
              value={eonixCost}
              onChange={(e) => setEonixCost(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2 bg-black/50 border-2 border-[#78CCEE] rounded-lg text-white focus:outline-none focus:border-[#41FFA3] transition-colors"
              placeholder="Enter Eonix cost..."
            />
          </div>

          {/* Big Items Selection */}
          {selectedUser.bigItemInventory && selectedUser.bigItemInventory.length > 0 && (
            <div className="p-4 bg-[#3E344A]/80 border-2 border-[#684095] rounded-lg">
              <p className="text-[#41FFA3] font-bold mb-3 uppercase text-sm">Select Big Items (Tokens):</p>
              <div className="grid grid-cols-1 gap-2">
                {selectedUser.bigItemInventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item, 'big')}
                    disabled={item.amount === 0}
                    className="bg-black/30 p-3 rounded border border-[#684095] hover:border-[#41FFA3] disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center transition-all"
                  >
                    <span className="text-white text-sm font-semibold">{item.name}</span>
                    <span className="text-[#41FFA3] font-bold">Available: {item.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Small Items Selection */}
          {selectedUser.smallItemInventory && selectedUser.smallItemInventory.length > 0 && (
            <div className="p-4 bg-[#3E344A]/80 border-2 border-[#684095] rounded-lg">
              <p className="text-[#78CCEE] font-bold mb-3 uppercase text-sm">Select Small Items (Materials):</p>
              <div className="grid grid-cols-1 gap-2">
                {selectedUser.smallItemInventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item, 'small')}
                    disabled={item.amount === 0}
                    className="bg-black/30 p-3 rounded border border-[#684095] hover:border-[#78CCEE] disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center transition-all"
                  >
                    <span className="text-white text-sm font-semibold">{item.name}</span>
                    <span className="text-[#78CCEE] font-bold">Available: {item.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div className="p-4 bg-[#3E344A]/80 border-2 border-[#41FFA3] rounded-lg">
              <p className="text-[#41FFA3] font-bold mb-3 uppercase text-sm flex items-center gap-2">
                <span>Items to Use:</span>
              </p>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-black/40 p-3 rounded flex justify-between items-center border border-[#684095]"
                  >
                    <span className={`text-sm font-semibold ${item.type === 'big' ? 'text-[#41FFA3]' : 'text-[#78CCEE]'}`}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemAmount(item.id, item.type, item.amount - 1)}
                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 rounded flex items-center justify-center transition-all"
                      >
                        <Minus size={16} className="text-red-400" />
                      </button>
                      <span className="text-white font-bold min-w-[40px] text-center">
                        {item.amount}x
                      </span>
                      <button
                        onClick={() => updateItemAmount(item.id, item.type, item.amount + 1)}
                        className="w-8 h-8 bg-green-500/20 hover:bg-green-500/40 rounded flex items-center justify-center transition-all"
                      >
                        <Plus size={16} className="text-green-400" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id, item.type)}
                        className="w-8 h-8 bg-gray-500/20 hover:bg-gray-500/40 rounded flex items-center justify-center transition-all ml-2"
                      >
                        <Trash2 size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full flex gap-4">
        <button
          onClick={handleUpgrade}
          disabled={!selectedUser || isLoading || (selectedUser?.rallyData?.access_card_level || 0) >= 5}
          className="flex-1 px-6 py-3 bg-[#41FFA3] hover:bg-[#2dd981] disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-impact text-xl rounded-lg transition-all shadow-lg hover:shadow-[#41FFA3]/30"
        >
          {isLoading ? "Upgrading..." : "UPGRADE"}
        </button>

        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-impact text-xl rounded-lg transition-all"
        >
          RESET
        </button>
      </div>
    </CardPanel>
  );
}