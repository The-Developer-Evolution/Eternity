"use client";

import { useState } from "react";
import { UserPlus, Loader2, CheckCircle, AlertCircle, Key, User } from "lucide-react";
import { createPlayerAccount } from "@/features/trading/services/account";

export default function NewAccountForm() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        try {
            const result = await createPlayerAccount(name, password);
            if (result.success) {
                setMessage({ type: "success", text: result.message || "Account created successfully!" });
                setName("");
                setPassword("");
            } else {
                const errorMsg = Array.isArray(result.error) ? result.error.join(", ") : result.error;
                setMessage({ type: "error", text: errorMsg || "Failed to create account." });
            }
        } catch {
            setMessage({ type: "error", text: "An unexpected error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md border border-purple-500/50 p-8 rounded-xl shadow-2xl flex flex-col gap-6">
            <h2 className="text-3xl font-impact text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider flex items-center justify-center gap-2">
                <UserPlus className="text-purple-400" /> NEW ACCOUNT
            </h2>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-blue-300 text-sm font-bold flex items-center gap-2">
                        <User size={16} /> USERNAME
                    </label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-blue-300 text-sm font-bold flex items-center gap-2">
                        <Key size={16} /> PASSWORD
                    </label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded p-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full py-3 rounded font-impact tracking-wider text-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                    CREATE ACCOUNT
                </button>
            </form>

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
    );
}
