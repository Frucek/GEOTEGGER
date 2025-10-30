"use client";

import {useState} from "react";
import Link from "next/link";
import {registerUser} from "@/app/lib/api";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (password !== repeatPassword) {
            setError("Gesli se ne ujemata.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            await registerUser(email, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#0b1622]">
            <div
                className="bg-[#162032] p-10 rounded-2xl shadow-lg w-96 text-center relative overflow-hidden border border-blue-400">
                <div
                    className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-600/50 to-transparent rounded-l-full blur-xl"></div>

                <div className="z-10 relative">
                    <div className="bg-purple-300 rounded-full w-20 h-20 mx-auto mb-4"></div>
                    <h2 className="text-white text-2xl font-bold mb-4">Registracija</h2>

                    <input
                        type="email"
                        placeholder="Elektronski naslov"
                        className="w-full mb-3 p-2 rounded bg-transparent border border-gray-400 text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Geslo"
                        className="w-full mb-3 p-2 rounded bg-transparent border border-gray-400 text-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Ponovite geslo"
                        className="w-full mb-3 p-2 rounded bg-transparent border border-gray-400 text-white"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                    />

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-transparent border border-yellow-400 text-yellow-400 p-2 rounded hover:bg-yellow-400 hover:text-black transition"
                    >
                        {loading ? "Registriram..." : "Registracija"}
                    </button>

                    {error && <p className="text-red-400 mt-3">{error}</p>}
                    {success && <p className="text-green-400 mt-3">Registracija uspešna!</p>}

                    <p className="mt-3 text-sm text-gray-400">
                        Že imate račun?{" "}
                        <Link href="/login" className="text-yellow-400 hover:underline">
                            Prijavite se tukaj
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}