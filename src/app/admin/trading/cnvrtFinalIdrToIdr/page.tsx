"use client";

import { useState, useTransition } from "react";
import { cnvrtFinalIdrToIdr } from "@/features/trading/services/cnvrtFinalIdrToIdr";

export default function ConvertFinalIdrPage() {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleConvert = () => {
        if (!confirm("Are you sure you want to convert all Final IDR values to the main IDR balance? This action cannot be undone.")) {
            return;
        }

        setStatus("idle");
        setMessage("");

        startTransition(async () => {
            const result = await cnvrtFinalIdrToIdr();
            setMessage(result.message);
            setStatus(result.success ? "success" : "error");
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-futura">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-impact text-[#78CCEE]">
                        Convert Final IDR to IDR
                    </h1>
                    <p className="text-slate-300 text-lg">
                        This tool will transfer the value from the <span className="font-mono bg-slate-800 px-2 py-1 rounded">finalIDR</span> field 
                        to the main <span className="font-mono bg-slate-800 px-2 py-1 rounded">idr</span> balance for all users.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-200">
                        <p className="font-bold">⚠️ Warning</p>
                        <p>This operation modifies user balances. Ensure that the trading period has ended before running this.</p>
                    </div>
                </div>

                <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 shadow-xl">
                    <button
                        onClick={handleConvert}
                        disabled={isPending}
                        className={`
                            w-full justify-center rounded-lg px-6 py-4 text-2xl font-impact tracking-wide
                            transition-all duration-200
                            ${isPending 
                                ? "bg-slate-600 cursor-not-allowed opacity-70" 
                                : "bg-[#78CCEE] text-[#3E344A] hover:bg-[#5AA8D6] hover:scale-[1.02] active:scale-[0.98]"
                            }
                        `}
                    >
                        {isPending ? "PROCESSING..." : "PROCESS CONVERSION"}
                    </button>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg border flex items-center gap-3 ${
                            status === "success" 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                                : "bg-red-500/10 border-red-500/30 text-red-300"
                        }`}>
                            <span className="text-xl">{status === "success" ? "✅" : "❌"}</span>
                            <p className="font-medium">{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
