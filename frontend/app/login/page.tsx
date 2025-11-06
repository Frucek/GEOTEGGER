    "use client";

    import {useState} from "react";
    import Link from "next/link";
    import {loginUser} from "@/app/lib/api";
    import {supabase} from "@/app/lib/supabaseClient";
    import {useRouter} from "next/navigation";


    export default function LoginPage() {
        const router = useRouter();

        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");
        const [loading, setLoading] = useState(false);

        const handleLogin = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await loginUser(email, password);
                localStorage.setItem("user", JSON.stringify(res.user));
                router.push("/")
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const handleGoogleLogin = async () => {
            try {
                const {data, error} = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: "http://localhost:3000/",
                    },
                });

                if (error) throw error;
            } catch (err) {
                console.error("Google login error:", err);
                alert("Napaka pri prijavi z Google!");
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
                        <h2 className="text-white text-2xl font-bold mb-4">Prijava</h2>

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

                        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-transparent border border-yellow-400 text-yellow-400 p-2 rounded hover:bg-yellow-400 hover:text-black transition"
                        >
                            {loading ? "Prijavljam..." : "Prijava"}
                        </button>

                        <button onClick={handleGoogleLogin}
                                className="w-full bg-transparent border border-gray-500 text-white p-2 rounded mt-3">
                            Prijavite se z Google
                        </button>

                        <p className="mt-3 text-sm text-gray-400 cursor-pointer hover:underline">
                            <Link href="/reset-password">Pozabljeno geslo</Link>
                        </p>

                        <p className="mt-3 text-sm text-gray-400">
                            Nimate računa?{" "}
                            <Link href="/register" className="text-yellow-400 hover:underline">
                                Registrirajte se tukaj
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        );
    }