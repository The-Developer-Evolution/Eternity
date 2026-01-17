"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { ShopUser, searchUsers } from "@/features/trading/services/shop";
import { getUserTradingLogs, TradingLogEntry } from "@/features/trading/services/history";
import { Loader2, User, Search, ArrowUpCircle, ArrowDownCircle, History, Filter, RefreshCw } from "lucide-react";
import { BalanceTradingResource } from "@prisma/client";

const RESOURCE_OPTIONS: (BalanceTradingResource | "ALL")[] = [
  "ALL",
  "ETERNITES",
  "IDR",
  "USD",
  "RAW",
  "CRAFT",
  "MAP",
];

export default function HistoryLogInterface() {
  const [userQuery, setUserQuery] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<ShopUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ShopUser | null>(null);
  
  const [logs, setLogs] = useState<TradingLogEntry[]>([]);
  const [userName, setUserName] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [userIdr, setUserIdr] = useState("0");
  const [userUsd, setUserUsd] = useState("0");
  
  const [resourceFilter, setResourceFilter] = useState<BalanceTradingResource | "ALL">("ALL");
  
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [reloadCooldown, setReloadCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (reloadCooldown <= 0) return;
    const timer = setTimeout(() => {
      setReloadCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [reloadCooldown]);

  // Debounced user search
  const performSearch = useMemo(
    () => debounce(async (query: string) => {
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

  // Fetch logs when user is selected
  const fetchLogsForUser = async (userId: string) => {
    setIsLoadingLogs(true);
    try {
      const result = await getUserTradingLogs(userId);
      if (result) {
        setLogs(result.logs);
        setUserName(result.userName);
        setUserBalance(result.userEternites);
        setUserIdr(result.userIdr);
        setUserUsd(result.userUsd);
      } else {
        setLogs([]);
        setUserName("");
        setUserBalance(0);
        setUserIdr("0");
        setUserUsd("0");
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
      setLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSelectUser = (user: ShopUser) => {
    setSelectedUser(user);
    setUserQuery(user.name);
    setMatchingUsers([]);
    setResourceFilter("ALL");
    fetchLogsForUser(user.id);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    // Use undefined for locale to auto-detect user's browser locale
    // timeZone defaults to the user's local timezone
    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatAmount = (amount: string) => {
    return Number(amount).toLocaleString('id-ID');
  };

  // Filtered logs based on resource filter
  const filteredLogs = useMemo(() => {
    if (resourceFilter === "ALL") return logs;
    return logs.filter(log => log.resource === resourceFilter);
  }, [logs, resourceFilter]);

  return (
    <div className="relative z-10 w-full max-w-6xl p-4">
      <div className="bg-gray-900/80 backdrop-blur-md border border-[#AE00DE] p-6 rounded-xl flex flex-col gap-6 shadow-2xl">
        <h2 className="text-2xl font-impact text-[#75E8F0] tracking-wider border-b border-gray-700 pb-2 flex items-center gap-3">
          <History size={28} /> TRADING LOG HISTORY
        </h2>

        {/* USER SEARCH */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
            <User size={16} /> SEARCH USER
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by User Name..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 pl-10 focus:border-[#75E8F0] outline-none transition-all"
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                if (selectedUser && e.target.value !== selectedUser.name) {
                  setSelectedUser(null);
                  setLogs([]);
                }
              }}
            />
            <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <Loader2 className="animate-spin text-[#75E8F0]" size={20} />
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
                  onClick={() => handleSelectUser(u)}
                >
                  <span className="text-white font-medium">{u.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded">ID: ...{u.id.slice(-4)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SELECTED USER INFO */}
        {selectedUser && (
          <div className="bg-purple-900/30 border border-purple-500/50 p-4 rounded">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-bold">{userName}</div>
                  <div className="text-xs text-gray-400">ID: {selectedUser.id}</div>
                </div>
                
                {/* RELOAD BUTTON */}
                <button
                  onClick={() => {
                    if (reloadCooldown > 0) return;
                    setReloadCooldown(3);
                    fetchLogsForUser(selectedUser.id);
                  }}
                  disabled={isLoadingLogs || reloadCooldown > 0}
                  className="ml-2 p-2 rounded-full hover:bg-purple-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={reloadCooldown > 0 ? `Wait ${reloadCooldown}s` : "Reload data"}
                >
                  <RefreshCw size={18} className={`text-gray-300 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* BALANCE DISPLAY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-black/30 px-4 py-2 rounded">
                  <div className="text-xs text-gray-400">Eternites</div>
                  <div className="text-lg font-bold text-[#75E8F0]">{userBalance.toLocaleString()}</div>
                </div>
                <div className="bg-black/30 px-4 py-2 rounded">
                  <div className="text-xs text-gray-400">IDR</div>
                  <div className="text-lg font-bold text-green-400">{formatAmount(userIdr)}</div>
                </div>
                <div className="bg-black/30 px-4 py-2 rounded">
                  <div className="text-xs text-gray-400">USD</div>
                  <div className="text-lg font-bold text-yellow-400">{formatAmount(userUsd)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCE FILTER */}
        {selectedUser && !isLoadingLogs && logs.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-gray-400 text-sm font-bold flex items-center gap-2">
              <Filter size={16} /> FILTER BY RESOURCE
            </label>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value as BalanceTradingResource | "ALL")}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 focus:border-[#75E8F0] outline-none"
            >
              {RESOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "ALL" ? "All Resources" : opt}
                </option>
              ))}
            </select>
            {resourceFilter !== "ALL" && (
              <span className="text-xs text-gray-400">
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
            )}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoadingLogs && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#75E8F0]" size={40} />
            <span className="ml-4 text-gray-400">Loading transaction history...</span>
          </div>
        )}

        {/* LOG TABLE */}
        {!isLoadingLogs && selectedUser && (
          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {logs.length === 0 
                  ? "No transaction history found for this user."
                  : `No ${resourceFilter} transactions found.`
                }
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Resource</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${
                          log.type === 'CREDIT' 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          {log.type === 'CREDIT' 
                            ? <ArrowDownCircle size={14} />
                            : <ArrowUpCircle size={14} /> 
                          }
                          {log.type === 'CREDIT' ? 'IN' : 'OUT'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
                          {log.resource}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${
                        log.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {log.type === 'CREDIT' ? '+' : '-'}{formatAmount(log.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate" title={log.message}>
                        {log.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {filteredLogs.length > 0 && (
              <div className="text-xs text-gray-500 text-center mt-4">
                Showing {filteredLogs.length} transactions
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {!selectedUser && !isLoadingLogs && (
          <div className="text-center py-16 text-gray-500">
            <History size={48} className="mx-auto mb-4 opacity-30" />
            <p>Search and select a user to view their transaction history.</p>
          </div>
        )}
      </div>
    </div>
  );
}

