"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

interface User {
  id: string;
  name: string;
  rallyData?: {
    enonix: number;
  };
}

interface PosOption {
  id: string;
  name: string;
  zone_id: string;
  zoneName: string;
  eonix_cost: number;
}

interface BuyPosPanelProps {
  users?: User[];
  posOptions?: PosOption[];
  onBuyAccess: (userId: string, posName: string, zoneId: string) => Promise<any>;
}

export default function BuyPosPanel({
  users = [],
  posOptions = [],
  onBuyAccess,
}: BuyPosPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPos, setSelectedPos] = useState<PosOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPosDropdown, setShowPosDropdown] = useState(false);

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

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
    setShowUserDropdown(true);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setShowUserDropdown(false);
    setError(null);
    setSuccess(null);
  };

  const handleSelectPos = (pos: PosOption) => {
    setSelectedPos(pos);
    setShowPosDropdown(false);
    setError(null);
    setSuccess(null);
  };

  const handleBuyAccess = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    if (!selectedPos) {
      setError("Please select a POS first");
      return;
    }

    const currentEnonix = selectedUser.rallyData?.enonix || 0;
    if (currentEnonix < selectedPos.eonix_cost) {
      setError(`User doesn't have enough Eonix (Required: ${selectedPos.eonix_cost}, Available: ${currentEnonix})`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onBuyAccess(
        selectedUser.id, 
        selectedPos.name, 
        selectedPos.zone_id
      );

      if (result.success) {
        setSuccess(
          `Successfully purchased access to ${selectedPos.name} for ${selectedUser.name}! Cost: ${selectedPos.eonix_cost} Eonix`
        );
        
        // Update local state - decrement eonix
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  rallyData: {
                    ...u.rallyData!,
                    enonix: Math.max(0, (u.rallyData?.enonix || 0) - selectedPos.eonix_cost),
                  },
                }
              : u
          )
        );
        setFilteredUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  rallyData: {
                    ...u.rallyData!,
                    enonix: Math.max(0, (u.rallyData?.enonix || 0) - selectedPos.eonix_cost),
                  },
                }
              : u
          )
        );
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                rallyData: {
                  ...prev.rallyData!,
                  enonix: Math.max(0, (prev.rallyData?.enonix || 0) - selectedPos.eonix_cost),
                },
              }
            : null
        );
      } else {
        setError(result.error || "Failed to purchase POS access");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-black/40 backdrop-blur-md rounded-2xl border-3 border-[#684095] shadow-2xl p-6">
      <h2 className="text-3xl font-impact text-[#78CCEE] mb-6 text-center">
        BUY POS ACCESS
      </h2>

      {/* User Search Section */}
      <div className="mb-6 relative">
        <label className="block text-[#78CCEE] font-bold mb-2">
          Search User
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowUserDropdown(true)}
            placeholder="Type user name..."
            className="w-full bg-[#3E344A] text-white px-4 py-3 rounded-lg border-2 border-[#684095] focus:border-[#78CCEE] outline-none transition-colors pr-10"
          />
          <ChevronDown 
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#78CCEE] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
            size={20}
          />
        </div>

        {/* User Dropdown */}
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
                    <p className="text-sm text-slate-400">
                      ID: {user.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#41FFA3] font-bold">
                      Eonix: {user.rallyData?.enonix || 0}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected User Info */}
      {selectedUser && (
        <div className="w-full p-4 bg-[#3E344A] border-2 border-[#78CCEE] rounded-lg mb-6">
          <div className="space-y-2">
            <p className="text-[#78CCEE] font-bold">Selected User:</p>
            <p className="text-white text-lg font-semibold">
              {selectedUser.name}
            </p>
            <div className="mt-3">
              <p className="text-slate-400 text-xs">Current Eonix</p>
              <p className="text-[#41FFA3] text-2xl font-impact">
                {selectedUser.rallyData?.enonix || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POS Selection Dropdown */}
      {selectedUser && (
        <div className="mb-6 relative">
          <label className="block text-[#78CCEE] font-bold mb-2">
            Select POS
          </label>
          <button
            onClick={() => setShowPosDropdown(!showPosDropdown)}
            className="w-full bg-[#3E344A] text-white px-4 py-3 rounded-lg border-2 border-[#684095] hover:border-[#78CCEE] transition-colors flex items-center justify-between"
          >
            <span>
              {selectedPos 
                ? `${selectedPos.name} (${selectedPos.zoneName}) - ${selectedPos.eonix_cost} Eonix` 
                : "Choose a POS..."}
            </span>
            <ChevronDown 
              className={`text-[#78CCEE] transition-transform ${showPosDropdown ? 'rotate-180' : ''}`}
              size={20}
            />
          </button>

          {/* POS Dropdown */}
          {showPosDropdown && (
            <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-[#3E344A] rounded-lg border-2 border-[#684095] shadow-xl">
              {posOptions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No POS available</p>
              ) : (
                posOptions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => handleSelectPos(pos)}
                    className={`w-full p-4 hover:bg-[#78CCEE]/20 transition-all text-left border-b border-[#684095]/30 last:border-b-0 ${
                      selectedPos?.id === pos.id ? 'bg-[#78CCEE]/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          <MapPin size={16} className="text-[#78CCEE]" />
                          {pos.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          Zone: {pos.zoneName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#41FFA3] font-bold">
                          {pos.eonix_cost} Eonix
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected POS Info */}
      {selectedPos && selectedUser && (
        <div className="mb-6 p-4 bg-[#3E344A]/50 rounded-lg border-2 border-[#684095]">
          <h3 className="text-[#78CCEE] font-bold mb-3">Purchase Summary:</h3>
          <div className="space-y-2 text-white">
            <div className="flex justify-between">
              <span className="text-slate-400">User:</span>
              <span className="font-bold">{selectedUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">POS:</span>
              <span className="font-bold">{selectedPos.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Zone:</span>
              <span className="font-bold">{selectedPos.zoneName}</span>
            </div>
            <div className="flex justify-between border-t border-[#684095] pt-2 mt-2">
              <span className="text-slate-400">Cost:</span>
              <span className="font-bold text-[#41FFA3]">{selectedPos.eonix_cost} Eonix</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Remaining Eonix:</span>
              <span className={`font-bold ${(selectedUser.rallyData?.enonix || 0) - selectedPos.eonix_cost < 0 ? 'text-red-400' : 'text-[#41FFA3]'}`}>
                {Math.max(0, (selectedUser.rallyData?.enonix || 0) - selectedPos.eonix_cost)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedUser && selectedPos && (
        <div className="mb-6">
          <button
            onClick={handleBuyAccess}
            disabled={isLoading || (selectedUser.rallyData?.enonix || 0) < selectedPos.eonix_cost}
            className="w-full bg-[#41FFA3] hover:bg-[#2ee089] disabled:bg-slate-600 text-[#3E344A] font-impact py-4 px-6 rounded-lg transition-colors text-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <MapPin className="text-2xl" />
            {isLoading ? "PROCESSING..." : `BUY ACCESS (${selectedPos.eonix_cost} EONIX)`}
          </button>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border-2 border-red-500 text-red-300 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border-2 border-green-500 text-green-300 p-4 rounded-lg mb-4">
          {success}
        </div>
      )}
    </div>
  );
}