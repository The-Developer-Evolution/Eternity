"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  rallyData?: {
    minus_point: number;
    point: number;
  };
}

interface MinusPointPanelProps {
  users?: User[];
  onMinusPoint: (userId: string, points: number) => Promise<any>;
  onNeutralizePoint: (userId: string, points: number) => Promise<any>;
}

export default function MinusPointPanel({
  users = [],
  onMinusPoint,
  onNeutralizePoint,
}: MinusPointPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointAmount, setPointAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setError(null);
    setSuccess(null);
    setPointAmount(1);
  };

  const handleMinusPoint = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    if (pointAmount <= 0) {
      setError("Point amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onMinusPoint(selectedUser.id, pointAmount);

      if (result.success) {
        setSuccess(
          `Successfully added ${pointAmount} minus point(s) to ${selectedUser.name}`
        );
        setPointAmount(1);
        
        // Update local state
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  rallyData: {
                    ...u.rallyData!,
                    minus_point: (u.rallyData?.minus_point || 0) + pointAmount,
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
                    minus_point: (u.rallyData?.minus_point || 0) + pointAmount,
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
                  minus_point: (prev.rallyData?.minus_point || 0) + pointAmount,
                },
              }
            : null
        );
      } else {
        setError(result.error || "Failed to minus point");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNeutralizePoint = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    if (pointAmount <= 0) {
      setError("Point amount must be greater than 0");
      return;
    }

    const currentMinusPoint = selectedUser.rallyData?.minus_point || 0;
    if (currentMinusPoint === 0) {
      setError("User has no minus points to neutralize");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onNeutralizePoint(selectedUser.id, pointAmount);

      if (result.success) {
        const actualNeutralized = Math.min(pointAmount, currentMinusPoint);
        setSuccess(
          `Successfully neutralized ${actualNeutralized} minus point(s) from ${selectedUser.name}`
        );
        setPointAmount(1);
        
        // Update local state
        const newMinusPoint = Math.max(0, currentMinusPoint - pointAmount);
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  rallyData: {
                    ...u.rallyData!,
                    minus_point: newMinusPoint,
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
                    minus_point: newMinusPoint,
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
                  minus_point: newMinusPoint,
                },
              }
            : null
        );
      } else {
        setError(result.error || "Failed to neutralize point");
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
        MINUS POINT MANAGEMENT
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
                    <p className="text-red-400 font-bold">
                      Minus: {user.rallyData?.minus_point || 0}
                    </p>
                    <p className="text-xs text-slate-400">
                      Point: {user.rallyData?.point || 0}
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
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-slate-400 text-xs">Current Minus Point</p>
                <p className="text-red-400 text-2xl font-impact">
                  {selectedUser.rallyData?.minus_point || 0}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Current Point</p>
                <p className="text-[#41FFA3] text-2xl font-impact">
                  {selectedUser.rallyData?.point || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Point Amount Input */}
      {selectedUser && (
        <div className="mb-6">
          <label className="block text-[#78CCEE] font-bold mb-2">
            Point Amount
          </label>
          <input
            type="number"
            min="1"
            value={pointAmount}
            onChange={(e) => setPointAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-[#3E344A] text-white px-4 py-3 rounded-lg border-2 border-[#684095] focus:border-[#78CCEE] outline-none transition-colors text-center text-xl font-bold"
          />
        </div>
      )}

      {/* Action Buttons */}
      {selectedUser && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleMinusPoint}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-slate-600 text-white font-impact py-3 px-6 rounded-lg transition-colors text-lg disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "ADD MINUS POINT"}
          </button>
          <button
            onClick={handleNeutralizePoint}
            disabled={isLoading || (selectedUser.rallyData?.minus_point || 0) === 0}
            className="bg-[#41FFA3] hover:bg-[#2ee089] disabled:bg-slate-600 text-[#3E344A] font-impact py-3 px-6 rounded-lg transition-colors text-lg disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "NEUTRALIZE POINT"}
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