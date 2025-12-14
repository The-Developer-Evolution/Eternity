'use client'
import { register } from "@/features/auth/action";
import { getUserRoles, UserRoles } from "@/features/auth/service";
import { itemToCraft } from "@/features/trading/services/craft";
import { buyMaterial } from "@/features/trading/services/buyRaw";
import { addTradingPointToUser } from "@/features/trading/services/talkshow";
import { CraftItem, RawMaterial, TradingAmounts } from "@/features/trading/types/craft";
import { getAllUserWithAdmin } from "@/features/user/service";
import { getUserTradingById } from "@/features/user/trading.service";
import { UserTrading } from "@/features/user/types";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { extractRawCraftAmounts } from "@/features/trading/utils";
import { craftToMap } from "@/features/trading/services/map";
import { convertCurrency } from "@/features/trading/services/currency";
import { givePitchingMoney, payPitchingFee } from "@/features/trading/services/pitching";

export default function Home() {
    const { data: session, status } = useSession();
    const [roles, setRoles] = useState<UserRoles | null>(null);
    const [user, setUser] = useState<UserTrading | null>(null);
    const [rawCraftAmount, setRawCraftAmount] = useState<TradingAmounts | null>(null);

    // get role
    useEffect(() => {
        if (!session?.user.id) return;
        async function fetchRoles() {
            const result = await getUserRoles(session!.user.id);
            const userDB = await getUserTradingById(session!.user.id);
            setRoles(result);

            if (userDB.success) {
                setUser(userDB.data!);
                const amounts = extractRawCraftAmounts(userDB.data!);
                setRawCraftAmount(amounts)
            }else{
                console.log(userDB.error);
            }
        }
        fetchRoles();
    }, [session?.user.id]);

    const StatCard = ({ label, value, colorClass = "text-white" }: { label: string, value: string | number | undefined, colorClass?: string }) => (
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
            <span className={`text-2xl font-bold mt-2 truncate ${colorClass}`}>{value ?? '-'}</span>
        </div>
    );

    const ActionButton = ({ onClick, children, variant = 'primary' }: { onClick: () => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger' | 'debug' }) => {
        const baseStyle = "w-full py-3 px-4 rounded-xl font-semibold transition-all transform active:scale-95 text-sm shadow-lg backdrop-blur-sm mb-2";
        const variants = {
            primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20",
            secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
            danger: "bg-red-900/10 hover:bg-red-900/30 text-red-200 border border-red-900/30",
            debug: "bg-amber-900/10 hover:bg-amber-900/20 text-amber-500 border border-dashed border-amber-900/30"
        };
        return (
            <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
                {children}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans selection:bg-indigo-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-slate-800/50">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Trading Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">System Management & Debugging Console</p>
                    </div>
                    {session ? (
                         <div className="text-right">
                             <div className="text-sm text-slate-400">Logged in as <span className="text-white font-medium">{session.user?.name || session.user?.email}</span></div>
                             <div className="text-xs text-slate-500 font-mono mt-1">ID: {session.user.id}</div>
                             <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-500/20">
                                 {roles?.role || 'User'}
                             </div>
                         </div>
                    ) : (
                        <div className="px-4 py-2 bg-slate-900 rounded-lg text-slate-400 text-sm border border-slate-800">
                            Not Authenticated
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content Area */}
                    <main className="lg:col-span-8 space-y-8">
                        
                        {user?.tradingData && (
                            <>
                                {/* Key Metrics */}
                                <section>
                                    <h2 className="text-xl font-semibold text-slate-300 mb-4 px-1">Financial Overview</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <StatCard label="IDR" value={user.tradingData.idr.toString()} colorClass="text-emerald-400" />
                                        <StatCard label="USD" value={user.tradingData.usd.toString()} colorClass="text-sky-400" />
                                        <StatCard label="Eternites" value={user.tradingData.eternites} colorClass="text-purple-400" />
                                        <StatCard label="Map" value={user.tradingData.map} colorClass="text-amber-400" />
                                        <StatCard label="Points" value={user.tradingData.point} />
                                    </div>
                                </section>

                                {/* Inventory */}
                                <section className="grid md:grid-cols-2 gap-6">
                                    {/* Raw Materials */}
                                    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
                                        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500"/> Raw Materials
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(rawCraftAmount?.raw || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center py-2 px-3 border border-slate-800/50 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors">
                                                    <span className="capitalize text-slate-400 text-sm">{key}</span>
                                                    <span className="font-mono text-slate-200 font-medium">{value as any}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Crafted Items */}
                                    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm">
                                        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"/> Crafted Items
                                        </h3>
                                         <div className="space-y-2">
                                            {Object.entries(rawCraftAmount?.craft || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center py-2 px-3 border border-slate-800/50 bg-slate-800/20 rounded-lg hover:bg-slate-800/40 transition-colors">
                                                    <span className="capitalize text-slate-400 text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="font-mono text-slate-200 font-medium">{value as any}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Transaction History */}
                                <section className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 h-[400px] flex flex-col backdrop-blur-sm">
                                    <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-500"/> Transaction Logs
                                    </h3>
                                    <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                         {user.tradingData.balanceTradingLogs.length === 0 ? (
                                            <div className="text-center text-slate-600 py-10 italic">No transactions recorded</div>
                                        ) : (
                                            user.tradingData.balanceTradingLogs.slice().reverse().map((log) => (
                                                <div key={log.id} className="flex items-center justify-between bg-slate-800/40 p-3 rounded-lg border border-slate-800/50 text-sm hover:border-slate-700 transition-colors">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-300 font-medium">{log.message}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${
                                                                log.type === 'CREDIT' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                                {log.type}
                                                            </span>
                                                            <span className="text-xs text-slate-500 uppercase">{log.resource}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`font-mono font-bold ${Number(log.amount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {Number(log.amount) > 0 ? '+' : ''}{log.amount.toString()}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </main>

                    {/* Sidebar / Controls */}
                    <aside className="lg:col-span-4 space-y-6">
                        
                        {/* Auth Panel */}
                        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Authentication</h3>
                             <ActionButton onClick={() => signIn("credentials", { name: "Admin SUPER", password: "Bravo456@", redirect: false })}>
                                Login as Super Admin
                            </ActionButton>
                            <div className="grid grid-cols-2 gap-3">
                            <ActionButton variant="secondary" onClick={() => register("Felix", "asdfasdfasdf")}>
                                    Register Test
                                </ActionButton>
                                <ActionButton variant="danger" onClick={() => signOut()}>
                                    Logout
                                </ActionButton>
                            </div>
                        </div>

                         {/* Debug Actions */}
                         <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Debug Actions</h3>
                             
                             <ActionButton variant="debug" onClick={() => addTradingPointToUser("cmj4dockx0008kohn1hv8eqgo", 20)}>
                                +20 Points (Debug)
                            </ActionButton>
                            
                             <ActionButton variant="secondary" onClick={async () => { console.log(await getAllUserWithAdmin()) }}>
                                Log All Users
                            </ActionButton>
                        </div>

                        {/* Trading Actions */}
                         <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl backdrop-blur-md">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trading Simulation</h3>
                            
                            <div className="space-y-3">
                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <div className="text-xs text-slate-400 mb-3 font-mono uppercase">Raw Material Market</div>
                                    <ActionButton onClick={async () => { console.log(await buyMaterial("cmj56jol2000bv8hnvmu9m9yt", RawMaterial.wood)) }}>
                                        Buy Wood
                                    </ActionButton>
                                    <ActionButton onClick={async () => { console.log(await buyMaterial("cmj56jol2000bv8hnvmu9m9yt", RawMaterial.coal)) }}>
                                        Buy Coal
                                    </ActionButton>
                                    <ActionButton onClick={async () => { console.log(await buyMaterial("cmj56jol2000bv8hnvmu9m9yt", RawMaterial.water)) }}>
                                        Buy Water
                                    </ActionButton>
                                </div>

                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <div className="text-xs text-slate-400 mb-3 font-mono uppercase">Crafting Station</div>
                                    <ActionButton onClick={async () => { console.log(await itemToCraft("cmj56jol2000bv8hnvmu9m9yt", "brownPaper")) }}>
                                        Craft Brown Paper
                                    </ActionButton>
                                    <ActionButton onClick={async () => { console.log(await itemToCraft("cmj56jol2000bv8hnvmu9m9yt", "pen")) }}>
                                        Craft Pen
                                    </ActionButton>
                                </div>

                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <div className="text-xs text-slate-400 mb-3 font-mono uppercase">Map Workshop</div>
                                     <ActionButton onClick={async () => { console.log(await craftToMap("cmj56jol2000bv8hnvmu9m9yt", ["brownPaper", "pen"])) }}>
                                        Craft Map (2 BrownPaper + 1 Pen)
                                    </ActionButton>
                                </div>

                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <div className="text-xs text-slate-400 mb-3 font-mono uppercase">Currency Converter</div>
                                     <ActionButton onClick={async () => { console.log(await convertCurrency("cmj56jol2000bv8hnvmu9m9yt", 16000, "IDR", "USD")) }}>
                                        Convert 16000 IDR to USD
                                    </ActionButton>
                                </div>
                                
                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                    <div className="text-xs text-slate-400 mb-3 font-mono uppercase">Pitching Station</div>
                                     <ActionButton onClick={async () => { console.log(await payPitchingFee("cmj56jol2000bv8hnvmu9m9yt")) }}>
                                        Pay Pitching Fee
                                    </ActionButton>
                                     <ActionButton onClick={async () => { console.log(await givePitchingMoney("cmj56jol2000bv8hnvmu9m9yt", 16000)) }}>
                                        Give Pitching Money
                                    </ActionButton>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
