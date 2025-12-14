'use client'

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import useSWR, { useSWRConfig } from "swr";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";

// --- Interfaces ---
interface LeaderboardRallyEntry {
  rank: number
  name: string
  access_card_level: number
  vault: number
  minus_point: number
  eonix: number
  isCurrentUser?: boolean
}

// Sesuaikan struktur ini dengan respons API backend Anda
interface LeaderboardResponse {
  data: LeaderboardRallyEntry[]
  totalPages: number
  currentPage: number
}

interface LeaderboardRallyProps {
  title?: string
  currentUserId?: string
  // Hapus 'data' dari props karena kita mengambilnya via SWR
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardRally({ 
  title = "Rally Leaderboard",
  currentUserId
}: LeaderboardRallyProps) {

  // 1. STATE DEFINITION (Harus paling atas)
  const [currentPage, setCurrentPage] = useState(1);
  const { mutate } = useSWRConfig();
  const limit = 8;

  // 2. DATA FETCHING
  // Menggunakan alias 'apiResponse' untuk menghindari konflik nama variabel
  const { data: apiResponse, error, isLoading } = useSWR<LeaderboardResponse>(
    `/api/leaderboard?page=${currentPage}&limit=${limit}`,
    fetcher,
    { 
      refreshInterval: 5000,
      keepPreviousData: true // UX agar tidak flickering saat ganti halaman
    }
  );

  // Extract data aman dari response
  const leaderboardData = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;

  // 3. PUSHER EFFECT
  useEffect(() => {
    pusherClient.subscribe("leaderboard-channel");
    pusherClient.subscribe("contest-channel");

    const handleUpdate = () => {
      // Refresh data halaman saat ini ketika ada update
      mutate(`/api/leaderboard?page=${currentPage}&limit=${limit}`);
    };

    pusherClient.bind("leaderboard-update", handleUpdate);
    pusherClient.bind("status-update", handleUpdate);

    return () => {
      pusherClient.unbind("leaderboard-update", handleUpdate);
      pusherClient.unbind("status-update", handleUpdate);
      pusherClient.unsubscribe("leaderboard-channel");
      pusherClient.unsubscribe("contest-channel");
    };
  }, [mutate, currentPage]);

  // 4. HANDLERS
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  }

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return "bg-yellow-500/20 border-yellow-500/50"
      case 2: return "bg-gray-400/20 border-gray-400/50"
      case 3: return "bg-amber-600/20 border-amber-600/50"
      default: return "bg-[#3E344A]/30 border-[#684095]/30"
    }
  }

  // 5. RENDER HELPERS
  const renderTableRow = (entry: LeaderboardRallyEntry) => {
    // Cek apakah row ini milik user yang sedang login (opsional logic)
    // Jika backend sudah mengirim flag 'isCurrentUser', gunakan itu.
    // Jika tidak, kita cek manual via props currentUserId (jika ada field id di entry)
    const isUserRow = entry.isCurrentUser; 

    return (
      <tr
        key={entry.rank} // Sebaiknya gunakan entry.id jika ada, rank bisa duplikat kalau bug
        className={`border-b border-[#684095]/30 transition-colors hover:bg-[#3E344A]/30 ${
          isUserRow ? 'bg-[#78CCEE]/20' : ''
        }`}
      >
        <td className="px-4 py-4">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 ${getRankColor(entry.rank)}`}>
            <span className={`font-impact text-lg ${
              entry.rank <= 3 ? 'text-white' : 'text-[#78CCEE]'
            }`}>
              {entry.rank}
            </span>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm font-futura text-white">
            {entry.name}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="font-impact text-lg text-[#78CCEE]">
            {entry.access_card_level}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="font-impact text-lg text-[#78CCEE]">
            {entry.vault}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="font-impact text-lg text-red-400">
            {entry.minus_point}
          </span>
        </td>
        <td className="px-4 py-4 text-center">
          <span className="font-impact text-lg text-[#78CCEE]">
            {entry.eonix}
          </span>
        </td>
      </tr>
    )
  }

  // 6. MAIN RENDER
  if (error) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border-3 border-[#684095] shadow-2xl overflow-hidden p-4 w-[80%] h-[400px] text-2xl font-impact flex items-center justify-center">
       No Player Earned Or Made Something Yet
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border-3 border-[#684095] shadow-2xl overflow-hidden">
        
        <div className="bg-[#04043A] p-6 border-b-3 border-[#684095]">
          <h2 className="text-4xl font-impact text-center text-white">
            {title}
          </h2>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading && !leaderboardData.length ? (
             <div className="w-full h-64 flex items-center justify-center text-[#75E8F0] [text-shadow:_0_0_20px_rgba(0,255,255,1)] text-xl">
               Loading data...
             </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#2f093b] border-b-2 text-white border-[#684095]">
                  <th className="px-4 py-3 text-left font-impact text-sm uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left font-impact text-sm uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">Vault</th>
                  <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">Minus Point</th>
                  <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">Eonix</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry) => renderTableRow(entry))}

                {leaderboardData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-slate-400 text-lg font-futura">
                        No data available
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-[#3E344A]/50 p-4 gap-4 border-t-3 border-[#684095] flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-[#78CCEE] text-[#3E344A] font-impact rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5AA8D6] transition-colors"
            >
              <FaChevronLeft />
            </button>

            <div className="flex gap-2">
              {/* Simple Pagination: Show current page info */}
               <span className="text-white font-impact flex items-center px-4">
                 Page {currentPage} of {totalPages}
               </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-[#78CCEE] text-[#3E344A] font-impact rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5AA8D6] transition-colors"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}