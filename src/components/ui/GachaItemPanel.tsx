"use client";

import { useState, useEffect } from "react";
import { FaDice } from "react-icons/fa";

interface User {
  id: string;
  name: string;
  rallyData?: {
    enonix: number;
  };
}

interface SmallItem {
  id: string;
  name: string;
}

interface GachaItemPanelProps {
  users?: User[];
  smallItems?: SmallItem[];
  onGacha: (userId: string) => Promise<any>;
}

export default function GachaItemPanel({
  users = [],
  smallItems = [],
  onGacha,
}: GachaItemPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [gachaResult, setGachaResult] = useState<SmallItem | null>(null);

  useEffect(() => {
    setAllUsers(users);
    setFilteredUsers(users);
  }, [users]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setError(null);
    setSuccess(null);
    setGachaResult(null);

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
    setError(null);
    setSuccess(null);
    setGachaResult(null);
  };

  const handleGacha = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    const currentEnonix = selectedUser.rallyData?.enonix || 0;
    if (currentEnonix < 10) {
      setError("User doesn't have enough Eonix (Required: 10)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setGachaResult(null);

    try {
      const result = await onGacha(selectedUser.id);

      if (result.success) {
        setSuccess(
          `Successfully performed gacha for ${selectedUser.name}!`
        );
        setGachaResult(result.item);
        
        // Update local state - decrement eonix
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  rallyData: {
                    ...u.rallyData!,
                    enonix: Math.max(0, (u.rallyData?.enonix || 0) - 10),
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
                    enonix: Math.max(0, (u.rallyData?.enonix || 0) - 10),
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
                  enonix: Math.max(0, (prev.rallyData?.enonix || 0) - 10),
                },
              }
            : null
        );
      } else {
        setError(result.error || "Failed to perform gacha");
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
        GACHA ITEM MANAGEMENT
      </h2>

      {/* Search Section */}
      <div className="mb-6">
        <label className="block text-[#78CCEE] font-bold mb-2">
          Search User
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type user name..."
          className="w-full bg-[#3E344A] text-white px-4 py-3 rounded-lg border-2 border-[#684095] focus:border-[#78CCEE] outline-none transition-colors"
        />
      </div>

      {/* User List */}
      <div className="mb-6 max-h-64 overflow-y-auto bg-[#3E344A]/50 rounded-lg border-2 border-[#684095]">
        <div className="p-2">
          {filteredUsers.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full p-3 mb-2 rounded-lg border-2 transition-all text-left ${
                  selectedUser?.id === user.id
                    ? "bg-[#78CCEE]/20 border-[#78CCEE]"
                    : "bg-[#3E344A] border-[#684095] hover:border-[#78CCEE]/50"
                }`}
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
            ))
          )}
        </div>
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

      {/* Gacha Info */}
      {selectedUser && smallItems.length > 0 && (
        <div className="mb-6 p-4 bg-[#3E344A]/50 rounded-lg border-2 border-[#684095]">
          <h3 className="text-[#78CCEE] font-bold mb-3">Possible Items:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {smallItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#3E344A] px-3 py-2 rounded-lg border border-[#684095] text-center"
              >
                <p className="text-white text-sm">{item.name}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3 text-center">
            Cost: 10 Eonix per gacha
          </p>
        </div>
      )}

      {/* Gacha Result */}
      {gachaResult && (
        <div className="mb-6 p-6 bg-gradient-to-r from-[#41FFA3]/20 to-[#78CCEE]/20 rounded-lg border-2 border-[#41FFA3] animate-pulse">
          <div className="text-center">
            <FaDice className="text-5xl text-[#41FFA3] mx-auto mb-3" />
            <h3 className="text-2xl font-impact text-[#41FFA3] mb-2">
              GACHA RESULT!
            </h3>
            <p className="text-white text-3xl font-bold">{gachaResult.name}</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedUser && (
        <div className="mb-6">
          <button
            onClick={handleGacha}
            disabled={isLoading || (selectedUser.rallyData?.enonix || 0) < 10}
            className="w-full bg-[#41FFA3] hover:bg-[#2ee089] disabled:bg-slate-600 text-[#3E344A] font-impact py-4 px-6 rounded-lg transition-colors text-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <FaDice className="text-2xl" />
            {isLoading ? "SPINNING..." : "PERFORM GACHA (10 EONIX)"}
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