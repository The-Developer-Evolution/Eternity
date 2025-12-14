'use client'
import React, { useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface LeaderboardTradingEntry {
  rank: number
  name: string
  team?: string
  idr: number
  usd: number
  eternites: number
  isCurrentUser?: boolean
}

interface LeaderboardTradingProps {
  data: LeaderboardTradingEntry[]
  title?: string
  currentUserId?: string
}

export default function LeaderboardTrading({ 
  data, 
  title = "Trading Leaderboard",
  currentUserId
}: LeaderboardTradingProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 8
  const totalPages = Math.ceil(data.length / itemsPerPage)
  
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1:
        return "bg-yellow-500/20 border-yellow-500/50"
      case 2:
        return "bg-gray-400/20 border-gray-400/50"
      case 3:
        return "bg-amber-600/20 border-amber-600/50"
      default:
        return "bg-[#3E344A]/30 border-[#684095]/30"
    }
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  const renderTableRow = (entry: LeaderboardTradingEntry, isUserRow: boolean = false) => (
    <tr
      key={entry.rank}
      className={`border-b border-[#684095]/30 transition-colors hover:bg-[#3E344A]/30 ${
        entry.isCurrentUser || isUserRow ? 'bg-[#78CCEE]/20' : ''
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
        <span className="text-white font-bold text-base font-futura">
          {entry.name}
          {(entry.isCurrentUser || isUserRow) && (
            <span className="ml-2 text-xs">(You)</span>
          )}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-futura">
          {entry.team || '-'}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="font-impact text-lg">
          {formatCurrency(entry.idr)}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="font-impact text-lg">
          {formatCurrency(entry.usd)}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="font-impact text-lg">
          {formatCurrency(entry.eternites)}
        </span>
      </td>
    </tr>
  )

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border-3 border-[#684095] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#04043A] p-6 border-b-3 border-[#684095]">
          <h2 className="text-4xl font-impact text-center text-white">
            {title}
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2f093b] border-b-2 text-white border-[#684095]">
                <th className="px-4 py-3 text-left font-impact text-sm uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left font-impact text-sm uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-impact text-sm uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">
                  IDR
                </th>
                <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">
                  USD
                </th>
                <th className="px-4 py-3 text-center font-impact text-sm uppercase tracking-wider">
                  Eternites
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((entry) => renderTableRow(entry))}

              {currentData.length === 0 && (
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-[#3E344A]/50 p-4 gap-4 border-t-3 border-[#684095] flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#78CCEE] text-[#3E344A] font-impact rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5AA8D6] transition-colors"
            >
              <FaChevronLeft />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-10 h-10 rounded-lg font-impact transition-colors ${
                    i === currentPage
                      ? 'bg-[#78CCEE] text-[#3E344A]'
                      : 'bg-[#3E344A] text-white hover:bg-[#4E445A]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
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