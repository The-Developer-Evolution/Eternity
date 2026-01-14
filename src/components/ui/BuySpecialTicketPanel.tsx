"use client";

import { useState, useEffect, useRef } from "react";
import { Ticket, Plus, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  rallyData?: {
    enonix: number;
    vault: number;
  };
}

interface BigItem {
  id: string;
  name: string;
}

interface SmallItem {
  id: string;
  name: string;
}

interface SelectedItem {
  id: string;
  name: string;
  type: 'big' | 'small';
  amount: number;
}

interface BuySpecialTicketPanelProps {
  users?: User[];
  bigItems: BigItem[];
  smallItems: SmallItem[];
  ticketName: string;
  ticketStock: number;
  onBuyTicket: (userId: string, items: { id: string; type: 'big' | 'small'; amount: number }[]) => Promise<any>;
}

export default function BuySpecialTicketPanel({
  users = [],
  bigItems,
  smallItems,
  ticketName,
  ticketStock,
  onBuyTicket,
}: BuySpecialTicketPanelProps) {
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string>("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalUsers(users);
    if (selectedUser) {
      const updated = users.find(u => u.id === selectedUser.id);
      if (updated) setSelectedUser(updated);
    }
  }, [users]);
``
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
    setSelectedItems([]);
  };

  const addItem = (item: BigItem | SmallItem, type: 'big' | 'small') => {
    if (selectedItems.length >= 2) {
      setError("Maksimal 2 item saja");
      toast.error("Maksimal 2 item saja");
      return;
    }
    
    if (selectedItems.find(i => i.id === item.id && i.type === type)) {
      setError("Item sudah dipilih");
      toast.error("Item sudah dipilih");
      return;
    }

    setSelectedItems([...selectedItems, { ...item, type, amount: 1 }]);
    setError(null);
  };

  const removeItem = (id: string, type: 'big' | 'small') => {
    setSelectedItems(selectedItems.filter(i => !(i.id === id && i.type === type)));
  };

  const updateAmount = (id: string, type: 'big' | 'small', delta: number) => {
    setSelectedItems(selectedItems.map(i => 
      i.id === id && i.type === type 
        ? { ...i, amount: Math.max(1, i.amount + delta) }
        : i
    ));
  };

  const handleBuyTicket = async () => {
    if (!selectedUser) {
      setError("Pilih user terlebih dahulu");
      toast.error("Pilih user terlebih dahulu");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Pilih minimal 1 item");
      toast.error("Pilih minimal 1 item");
      return;
    }

    if (ticketStock <= 0) {
      setError("Special ticket sudah habis");
      toast.error("Special ticket sudah habis");
      return;
    }

    const confirmAction = window.confirm(
      `Beli Special Ticket untuk ${selectedUser.name} dengan:\n` +
      selectedItems.map(i => `- ${i.amount}x ${i.name}`).join('\n')
    );
    
    if (!confirmAction) return;

    setIsLoading(true);
    setError(null);
    setSuccess("");

    try {
      const res = await onBuyTicket(
        selectedUser.id, 
        selectedItems.map(i => ({ id: i.id, type: i.type, amount: i.amount }))
      );

      if (res.success) {
        setSuccess(`Special Ticket berhasil dibeli untuk ${selectedUser.name}!`);
        toast.success(`Special Ticket berhasil dibeli untuk ${selectedUser.name}!`);
        setSelectedItems([]);
      } else {
        toast.error(res.error || "Gagal membeli special ticket");
        setError(res.error || "Gagal membeli special ticket");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const allItems = [
    ...bigItems.map(i => ({ ...i, type: 'big' as const })),
    ...smallItems.map(i => ({ ...i, type: 'small' as const }))
  ];

  return (
    <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl border-3 border-[#684095] shadow-2xl p-6 relative z-50">
      <h2 className="text-3xl font-impact text-[#78CCEE] mb-6 text-center uppercase tracking-wider flex items-center justify-center gap-3">
        <Ticket size={32} /> BUY SPECIAL TICKET
      </h2>

      {/* Ticket Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-[#41FFA3]/20 to-[#78CCEE]/20 rounded-lg border-2 border-[#41FFA3]">
        <p className="text-white text-lg font-bold">{ticketName}</p>
        <p className="text-[#41FFA3] text-sm">Stock: {ticketStock}</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border-2 border-green-500 rounded-lg text-green-200 text-sm">
          {success}
        </div>
      )}

      {/* User Selection */}
      <div className="mb-6 relative" ref={dropdownRef}>
        <label className="text-[#78CCEE] font-bold mb-2 block">SELECT USER</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search user..."
            value={selectedUser ? selectedUser.name : searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedUser) setSelectedUser(null);
              setShowUserDropdown(true);
            }}
            onFocus={() => setShowUserDropdown(true)}
            className="w-full bg-[#3E344A] text-white border-2 border-[#684095] rounded-lg p-3 pr-10 focus:border-[#78CCEE] outline-none transition-all"
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
                  </div>
                  <div className="text-right">
                    <p className="text-[#41FFA3] text-xs">Eonix: {user.rallyData?.enonix || 0}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected User Info */}
      {selectedUser && (
        <div className="mb-6 p-4 bg-[#3E344A]/60 rounded-lg border-2 border-[#78CCEE]">
          <p className="text-[#78CCEE] font-bold">Selected User:</p>
          <p className="text-white text-lg font-semibold">{selectedUser.name}</p>
        </div>
      )}

      {/* Item Selection */}
      {selectedUser && (
        <div className="mb-6">
          <label className="text-[#78CCEE] font-bold mb-2 block">
            SELECT ITEMS (Max 2)
          </label>
          
          {/* Selected Items List */}
          {selectedItems.length > 0 && (
            <div className="mb-4 space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-[#3E344A] border-2 border-[#41FFA3] p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-bold">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.type === 'big' ? 'Big Item' : 'Small Item'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateAmount(item.id, item.type, -1)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1 rounded"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                    <span className="text-white font-bold w-8 text-center">
                      {item.amount}
                    </span>
                    <button
                      onClick={() => updateAmount(item.id, item.type, 1)}
                      className="bg-green-500/20 hover:bg-green-500/40 text-green-400 p-1 rounded"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id, item.type)}
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Available Items Grid */}
          {selectedItems.length < 2 && (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {allItems.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => addItem(item, item.type)}
                  disabled={selectedItems.some(i => i.id === item.id && i.type === item.type)}
                  className="bg-[#3E344A] hover:bg-[#78CCEE]/20 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#684095] hover:border-[#78CCEE] p-3 rounded-lg text-left transition-all"
                >
                  <p className="text-white font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400">
                    {item.type === 'big' ? 'Big Item' : 'Small Item'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buy Button */}
      {selectedUser && selectedItems.length > 0 && (
        <button
          onClick={handleBuyTicket}
          disabled={isLoading || ticketStock <= 0}
          className="w-full bg-[#41FFA3] hover:bg-[#2ee089] disabled:bg-slate-600 text-[#3E344A] font-impact py-4 px-6 rounded-lg transition-colors text-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Ticket size={24} />
          {isLoading ? "Processing..." : "BUY SPECIAL TICKET"}
        </button>
      )}
    </div>
  );
}