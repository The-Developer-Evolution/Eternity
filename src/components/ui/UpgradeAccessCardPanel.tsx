'use client'

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  rallyData?: {
    access_card_level: number;
    enonix: number;
  };
}

interface UpgradeAccessCardPanelProps {
  users?: User[];
}

export default function UpgradeAccessCardPanel({ 
  users = [] 
}: UpgradeAccessCardPanelProps) {
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const handleUpgrade = async () => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/rally/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      const data = await response.json();

      if (data.success) {
        const newLevel = data.newLevel;
        setSuccess(`Successfully upgraded ${selectedUser.name} to level ${newLevel}`);
        
        // Update user in list
        const updatedUsers = allUsers.map(u => 
          u.id === selectedUser.id 
            ? { ...u, rallyData: { ...u.rallyData!, access_card_level: newLevel } }
            : u
        );
        setAllUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Reset
        setSelectedUser(null);
        setSearchQuery("");
        
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
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="p-8 rounded-lg bg-gradient-to-b from-[#79CCEE]/40 to-[#1400CC]/40 backdrop-blur-md shadow-lg border-[#684095] border-3 flex flex-col justify-center items-center gap-6">
        <h1 className="text-4xl font-impact text-center text-white">
          UPGRADE ACCESS CARD
        </h1>

        {/* Search Bar */}
        <div className="w-full">
          <label className="block text-[#78CCEE] font-bold text-sm mb-2 uppercase tracking-wide">
            Search User
          </label>
          <input
            type="text"
            placeholder="Enter username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-[#23328C]/50 border-2 border-[#78CCEE] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#41FFA3] transition-colors"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full p-4 bg-red-500/20 border-2 border-red-500 rounded-lg text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="w-full p-4 bg-green-500/20 border-2 border-green-500 rounded-lg text-green-300 text-sm text-center">
            {success}
          </div>
        )}

        {/* User Selection List */}
        <div className="w-full">
          <label className="block text-[#78CCEE] font-bold text-sm mb-3 uppercase tracking-wide">
            Select User ({filteredUsers.length})
          </label>
          
          <div className="max-h-64 overflow-y-auto bg-[#23328C]/30 border-2 border-[#684095] rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 text-left border-b border-[#684095]/30 transition-all hover:bg-[#78CCEE]/10 ${
                    selectedUser?.id === user.id
                      ? "bg-[#78CCEE]/30 border-l-4 border-l-[#78CCEE]"
                      : ""
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
                        Level {user.rallyData?.access_card_level || 0}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user.rallyData?.enonix || 0} Eonix
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
          <div className="w-full p-4 bg-[#3E344A] border-2 border-[#78CCEE] rounded-lg">
            <div className="space-y-2">
              <p className="text-[#78CCEE] font-bold">Selected User:</p>
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex gap-4">
          <button
            onClick={handleUpgrade}
            disabled={!selectedUser || isLoading}
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
      </div>
    </div>
  );
}