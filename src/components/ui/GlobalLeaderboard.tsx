'use client'

import { FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash } from 'react-icons/fa'
import useSWR, { useSWRConfig } from "swr";
import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher";
import { Role } from '@/generated/prisma/enums';
import { useSession } from 'next-auth/react';

interface LeaderboardEntry {
    rank: number
    name: string
    access_card_level: number
    vault: number
    minus_point: number
    eonix: number
    totalPoints: number
    isCurrentUser?: boolean
}

interface LeaderboardResponse {
    data: LeaderboardEntry[]
    totalPages: number
    currentPage: number
}

interface LeaderboardProps {
    title?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GlobalLeaderboard({
    title = "Global Leaderboard",
}: LeaderboardProps) {

    const [currentPage, setCurrentPage] = useState(1);
    const [isTop10Blurred, setIsTop10Blurred] = useState(true);
    const { mutate } = useSWRConfig();
    const { data: session } = useSession();
    const [canRevealTop10, setCanRevealTop10] = useState(false);

    useEffect(() => {
        if (session?.user?.role === Role.SUPER) {
            setCanRevealTop10(true);
        } else {
            setCanRevealTop10(false);
        }
    }, [session]);

    if (!session || !session.user) {
        return null;
    }

    const limit = 10;

    const { data: apiResponse, error, isLoading } = useSWR<LeaderboardResponse>(
        `/api/global-leaderboard?page=${currentPage}&limit=${limit}`,
        fetcher,
        {
            refreshInterval: 10000,
            keepPreviousData: true
        }
    );

    const leaderboardData = apiResponse?.data || [];
    const totalPages = apiResponse?.totalPages || 1;

    useEffect(() => {
        const pusher = getPusherClient();
        if (!pusher) return;

        const channel = pusher.subscribe("leaderboard-channel");
        const handleUpdate = () => {
            mutate(`/api/global-leaderboard?page=${currentPage}&limit=${limit}`);
        };
        channel.bind("leaderboard-update", handleUpdate);
        return () => {
            channel.unbind("leaderboard-update", handleUpdate);
            pusher.unsubscribe("leaderboard-channel");
        };
    }, [mutate, currentPage, limit]);

    const renderTableRow = (entry: LeaderboardEntry) => {
        const shouldBlur = entry.rank <= 10 && isTop10Blurred;

        const blurClass = shouldBlur ? "blur-md select-none transition-all duration-500" : "transition-all duration-500";

        return (
            <tr
                key={entry.rank}
                className={`border-b border-[#684095]/30 hover:bg-[#3E344A]/30 transition-colors ${entry.isCurrentUser ? 'bg-[#78CCEE]/20' : ''}`}
            >
                <td className="px-4 py-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-impact text-lg 
            ${entry.rank === 1 ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" :
                            entry.rank === 2 ? "bg-gray-400/20 border-gray-400/50 text-gray-300" :
                                entry.rank === 3 ? "bg-amber-700/20 border-amber-700/50 text-amber-500" :
                                    "bg-[#3E344A]/30 border-[#684095]/30 text-[#78CCEE]"
                        }`}>
                        {entry.rank}
                    </div>
                </td>

                <td className="px-4 py-4">
                    <span className={`text-sm font-futura text-white block ${blurClass}`}>
                        {entry.name}
                    </span>
                </td>

                <td className="px-4 py-4 text-center">
                    <span className={`font-futura text-xl text-white block ${blurClass}`}>
                        {Number(entry.totalPoints ?? 0).toFixed(2)}
                    </span>
                </td>

                <td className="px-4 py-4 text-center">
                    <span className={`font-futura text-lg text-white block ${blurClass}`}>
                        {entry.minus_point}
                    </span>
                </td>
            </tr>
        )
    }

    if (error) return <div className="text-red-500 text-center p-10 font-bold">Error Loading Leaderboard</div>;

    return (
        <div className="w-full max-w-7xl my-[10%] md:my-[5%] mx-auto relative z-10">
            <div className="bg-black/50 backdrop-blur-2xl rounded-2xl border-3 border-[#684095] shadow-[0_0_50px_rgba(104,64,149,0.3)] overflow-hidden">

                <div className="bg-[#04043A] p-6 border-b-3 border-[#684095] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1"></div>

                    <h2 className="text-4xl font-impact text-white tracking-wider drop-shadow-lg w-full text-center">
                        {title.toUpperCase()}
                    </h2>

                    {canRevealTop10 &&
                        <>
                            <div className="flex-1 flex justify-end">
                                <button
                                    onClick={() => setIsTop10Blurred(!isTop10Blurred)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#684095]/50 hover:bg-[#684095] border border-[#78CCEE]/30 rounded-lg text-white transition-all active:scale-95"
                                >
                                    {isTop10Blurred ? <FaEye className="text-[#78CCEE]" /> : <FaEyeSlash className="text-red-400" />}
                                    <span className="font-impact text-sm uppercase tracking-wide">
                                        {isTop10Blurred ? "Reveal" : "Hide"}
                                    </span>
                                </button>
                            </div>
                        </>
                    }
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading && !leaderboardData.length ? (
                        <div className="w-full h-96 flex flex-col items-center justify-center text-[#78CCEE]">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-current mb-4"></div>
                            <span className="font-impact tracking-widest">CALCULATING SCORES...</span>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#2f093b] border-b-2 text-white border-[#684095]">
                                    <th className="px-4 py-4 text-left font-impact text-lg text-white w-20">RK</th>
                                    <th className="px-4 py-4 text-left font-impact text-lg text-white">PARTICIPANT</th>
                                    <th className="px-4 py-4 text-center font-impact text-lg text-white">TOTAL SCORE</th>
                                    <th className="px-4 py-4 text-center font-impact text-sm text-white">MINUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry) => renderTableRow(entry))}
                                {leaderboardData.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-10 text-slate-400 italic">No Data Available</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="bg-[#3E344A]/50 p-4 border-t-3 border-[#684095] flex items-center justify-between relative z-50">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-6 py-2 bg-[#78CCEE] text-[#04043A] font-impact rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5AA8D6]"
                        >
                            <FaChevronLeft /> PREV
                        </button>

                        <span className="text-white font-impact text-lg bg-black/30 px-6 py-2 rounded-lg border border-white/10">
                            PAGE {currentPage} <span className="text-[#78CCEE]">/</span> {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-6 py-2 bg-[#78CCEE] text-[#04043A] font-impact rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#5AA8D6]"
                        >
                            NEXT <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}