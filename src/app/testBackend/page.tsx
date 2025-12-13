'use client'
import { register } from "@/features/auth/action";
import { getUserRoles, UserRoles } from "@/features/auth/service";
import { addTradingPointToUser } from "@/features/trading/service";
import { getAllUser, getAllUserWithAdmin } from "@/features/user/service";
import { AdminTradingRole } from "@/generated/prisma/enums";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
    const { data: session, status } = useSession();
    const [roles, setRoles] = useState<UserRoles | null>(null);
    
    // get role
    useEffect(() => {
        if (!session?.user.id) return;
        async function fetchRoles() {
            const result = await getUserRoles(session!.user.id);
            setRoles(result);
        }
        fetchRoles();
    }, [session?.user.id]);

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


            <button 
                onClick={() => { addTradingPointToUser("cmj423xtv000stwhnn47623go", 20) }}
                className="w-full py-3 px-6 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Debug: Deduct 100 Points
            </button>

            <button 
                onClick={async () => { console.log( await getAllUserWithAdmin()) }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Run Service
            </button>

            </div>

        </div>
        </div>
    );
}
