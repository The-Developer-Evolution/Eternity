'use client'
import { register } from "@/features/auth/action";
import { getUserRoles, UserRoles } from "@/features/auth/service";
import { itemToCraft } from "@/features/trading/services/craft";
import { buyMaterial } from "@/features/trading/services/buyRaw";
import { addTradingPointToUser } from "@/features/trading/services/talkshow";
import { CraftItem, RawMaterial, TradingAmounts } from "@/features/trading/types/craft";
import {  getAllUserWithAdmin } from "@/features/user/service";
import { getUserTradingById } from "@/features/user/trading.service";
import { UserTrading } from "@/features/user/types";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { extractRawCraftAmounts } from "@/features/trading/utils";

export default function Home() {
    const { data: session, status } = useSession();
    const [roles, setRoles] = useState<UserRoles | null>(null);
    const [user, setUser] = useState<UserTrading | null> (null);
    const [rawCraftAmount, setRawCraftAmount] = useState<TradingAmounts | null>(null);
    
    // get role
    useEffect(() => {
        if (!session?.user.id) return;
        async function fetchRoles() {
            const result = await getUserRoles(session!.user.id);
            const userDB = await getUserTradingById(session!.user.id);
            setRoles(result);
            if(userDB.success){
                setUser(userDB.data!);
                const amounts = extractRawCraftAmounts(userDB.data!);
                setRawCraftAmount(amounts)
            }
        }
        fetchRoles();
    }, [session?.user.id]);

    // show all trading data


    return (
        <div className="w-screen h-screen flex justify-center items-center bg-slate-900 text-white">
        {/* Card Container */}
        <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Trading
            </h1>
            <p className="text-slate-400 text-sm">Manage your assets and points securely.</p>
            {session && (
                <>
                    <p className="text-slate-400 text-sm">YOU ARE LOGGED IN</p>
                    <p className="text-slate-400 text-sm">your ROLE is : {roles?.role}</p>
                    <p className="text-slate-400 text-sm">your ID is : {session?.user.id}</p>
                    {user?.tradingData && (
                        <div className="mt-4 space-y-4">

                            {/* ================= Trading Data ================= */}
                            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-2 text-sm">
                            <h2 className="text-slate-300 font-semibold">Trading Data</h2>

                            <div className="flex justify-between">
                                <span className="text-slate-400">IDR</span>
                                <span>{user.tradingData.idr.toString()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">USD</span>
                                <span>{user.tradingData.usd.toString()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Eternites</span>
                                <span>{user.tradingData.eternites}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Map</span>
                                <span>{user.tradingData.map}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-400">Points</span>
                                <span>{user.tradingData.point}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Wood</span>
                                <span>{rawCraftAmount?.raw.wood}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Glass</span>
                                <span>{rawCraftAmount?.raw.glass}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">coal</span>
                                <span>{rawCraftAmount?.raw.coal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Metal</span>
                                <span>{rawCraftAmount?.raw.metal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Water</span>
                                <span>{rawCraftAmount?.raw.water}</span>
                            </div>

                            {/* crafted */}
                            <div className="flex justify-between">
                                <span className="text-slate-400">Brown Paper</span>
                                <span>{rawCraftAmount?.craft.brownPaper}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Dividers</span>
                                <span>{rawCraftAmount?.craft.dividers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Ink</span>
                                <span>{rawCraftAmount?.craft.ink}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Pen</span>
                                <span>{rawCraftAmount?.craft.pen}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Magnifier</span>
                                <span>{rawCraftAmount?.craft.magnifyingGlass}</span>
                            </div>
                            </div>

                            {/* ================= Balance Logs ================= */}
                            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-3 text-sm h-25 overflow-y-auto">
                            <h2 className="text-slate-300 font-semibold">Balance History</h2>

                            {user.tradingData.balanceTradingLogs.length === 0 ? (
                                <p className="text-slate-500 text-xs">No transactions yet</p>
                            ) : (
                                <ul className="space-y-2">
                                {user.tradingData.balanceTradingLogs.map((log) => (
                                    <li
                                    key={log.id}
                                    className="flex justify-between items-center rounded-lg bg-slate-800/50 px-3 py-2"
                                    >
                                    <div className="flex flex-col">
                                        <span className="text-slate-300">{log.message}</span>
                                        <span className="text-xs text-slate-500">
                                        {log.resource} • {log.type}
                                        </span>
                                    </div>

                                    <span
                                        className={
                                        log.amount > 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }
                                    >
                                        {log.amount > 0 ? "+" : ""}
                                        {log.amount.toString()}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            </div>

                        </div>
                        )}

                    
                </>
            )}

            </div>

            {/* Divider */}
            <div className="h-px bg-slate-700 w-full" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
            <button 
                onClick={() => { signIn("credentials",
                    {
                        email:"admin@super.eternity",
                        password:"Bravo456@",
                        redirect:false
                    }
                    // {
                    //     email:"admin@talkshow.eternity",
                    //     password:"Alpha123!",
                    //     redirect:false
                    // }
                ) }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Log In to Account
            </button>

            <button 
                onClick={() => { signOut() }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Logout
            </button>
            
            <button 
                onClick={() => { register("Felix", "f@gmail.com", "asdfasdfasdf", "78546312456") }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Register an Account
            </button>

{/* Add Trading Point (for talkshow) */}
            <button 
                onClick={() => { addTradingPointToUser("cmj4dockx0008kohn1hv8eqgo", 20) }}
                className="w-full py-3 px-6 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Debug: Add 100 Points
            </button>

{/* Get User */}
            <button 
                onClick={async () => { console.log( await getAllUserWithAdmin()) }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Run Service
            </button>

{/* buy material (admin RAW) */}
            <button 
                onClick={async () => { console.log( await buyMaterial("cmj4f6rk3000bu8hnardju86e", RawMaterial.wood)) }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Buy Material
            </button>

{/* convert raw to craft */}
            <button 
                onClick={async () => { console.log( await itemToCraft("cmj4f6rk3000bu8hnardju86e", "brownPaper")) }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Convert Raw to Craft
            </button>


{/* convert raw to craft */}
            <button 
                onClick={async () => { console.log( await itemToCraft("cmj4f6rk3000bu8hnardju86e", "brownPaper")) }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Convert Raw to Craft
            </button>

            </div>
        </div>
        </div>
    );
}
