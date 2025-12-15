"use client";

import { useState, useEffect } from "react";
import { Hammer, ChevronDown } from "lucide-react";

interface User {
  id: string;
  name: string;
  rallyData?: {
    vault: number;
  };
}

interface CraftVaultPanelProps {
  users?: User[];
  onCraftVault: (userId: string) => Promise<any>;
}

export default function CraftVaultPanel({
  users = [],
  onCraftVault,
}: CraftVaultPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  const handleCraftVault = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onCraftVault(selectedUser.id);

      if (result.success) {
        setSuccess(
          `Successfully crafted The Vault for ${selectedUser.name}! Total Vault: ${result.newVaultCount}`
        );
        
        // Update local state
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  rallyData: {
                    ...u.rallyData!,
                    vault: (u.rallyData?.vault || 0) + 1,
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
                    vault: (u.rallyData?.vault || 0) + 1,
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
                  vault: (prev.rallyData?.vault || 0) + 1,
                },
              }
            : null
        );
      } else {
        setError(result.error || "Failed to craft vault");
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
        CRAFT THE VAULT
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
                      Vault: {user.rallyData?.vault || 0}
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
              <p className="text-slate-400 text-xs">Current Vault Count</p>
              <p className="text-[#41FFA3] text-2xl font-impact">
                {selectedUser.rallyData?.vault || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vault Info Box */}
      {selectedUser && (
        <div className="mb-6 p-4 bg-[#3E344A]/50 rounded-lg border-2 border-[#684095]">
          <h3 className="text-[#78CCEE] font-bold mb-3">Craft Summary:</h3>
          <div className="space-y-2 text-white">
            <div className="flex justify-between">
              <span className="text-slate-400">User:</span>
              <span className="font-bold">{selectedUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Vault:</span>
              <span className="font-bold text-[#41FFA3]">{selectedUser.rallyData?.vault || 0}</span>
            </div>
            <div className="flex justify-between border-t border-[#684095] pt-2 mt-2">
              <span className="text-slate-400">New Vault Count:</span>
              <span className="font-bold text-[#78CCEE]">{(selectedUser.rallyData?.vault || 0) + 1}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedUser && (
        <div className="mb-6">
          <button
            onClick={handleCraftVault}
            disabled={isLoading}
            className="w-full bg-[#41FFA3] hover:bg-[#2ee089] disabled:bg-slate-600 text-[#3E344A] font-impact py-4 px-6 rounded-lg transition-colors text-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Hammer className="text-2xl" />
            {isLoading ? "CRAFTING..." : "CRAFT VAULT"}
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