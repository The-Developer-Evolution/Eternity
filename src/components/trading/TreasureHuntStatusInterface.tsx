"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { updateThunt } from "@/features/trading/services/thunt";
import { Loader2, CheckCircle, AlertCircle, User, Flag, CheckSquare } from "lucide-react";

export default function TreasureHuntStatusInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
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

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;

    setIsTransacting(true);
    setMessage(null);

    try {
      const result = await updateThunt(selectedUser.id);
      
      if (result.success) {
        setMessage({ type: "success", text: "User marked as played successfully!" });
      } else {
        const errorMsg = Array.isArray(result.error) ? result.error.join(", ") : result.error;
        setMessage({ type: "error", text: errorMsg || "Update failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* LEFT COLUMN: INTERFACE */}
      <div className="bg-gray-900/80 backdrop-blur-md border border-cyan-500 p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-cyan-400 tracking-wider border-b border-gray-700 pb-2 flex items-center gap-2">
          <Flag className="text-cyan-400" /> TREASURE HUNT CHECK
        </h2>

        {/* 1. USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> PARTICIPANT
          </label>
          <div className="relative">
             <input
              type="text"
              placeholder="Search Participant..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-cyan-400 outline-none transition-all"
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
                <Loader2 className="animate-spin text-cyan-400" size={20} />
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

        {/* INFO BOX */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
                 <CheckSquare size={18} /> STATUS UPDATE
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Action</span>
                <span className="text-white">Mark as Played</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                This will mark the user as having participated in the Treasure Hunt.
            </p>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleUpdateStatus}
          disabled={!selectedUser || isTransacting}
          className={`w-full py-4 rounded-lg font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            !selectedUser || isTransacting
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 to-blue-700 text-white hover:scale-[1.02] hover:shadow-cyan-500/50"
          }`}
        >
          {isTransacting ? (
            <>
              <Loader2 className="animate-spin" /> UPDATING...
            </>
          ) : (
            <>
              <CheckCircle size={20} /> MARK AS PLAYED
            </>
          )}
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
      <div className="hidden md:flex flex-col justify-center gap-6 text-white bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
        <h3 className="text-xl font-impact text-gray-300">STATUS PREVIEW</h3>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">USER</span>
                <span className="font-bold text-lg">{selectedUser?.name || "---"}</span>
            </div>
             <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded">
                <span className="text-gray-400 text-sm">NEW STATUS</span>
                <span className="font-bold text-lg text-green-400">PLAYED</span>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            This action is recorded in the system.
        </div>
      </div>
    </div>
  );
}
