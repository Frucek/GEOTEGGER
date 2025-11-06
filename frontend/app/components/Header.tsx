"use client";

import Image from "next/image";
import Link from "next/link";
import {supabase} from "@/app/lib/supabaseClient";
import {useRouter} from "next/navigation";
import {logoutUser} from "@/app/lib/api";

export default function Header() {

    const router = useRouter();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // await logoutUser();
            localStorage.removeItem("user");
            sessionStorage.clear();
            router.push("/login");

        } catch (err) {
            console.error("Logout error:", err);
            alert("Napaka pri odjavi!");
        }
    };


    return (
        <header className="bg-[#1b2945] text-white py-4 px-8 flex justify-between items-center shadow-md">
            <div className="text-2xl font-bold tracking-wider">
                GEOTEGGER
            </div>

            <nav className="flex gap-8 text-sm">
                <Link href="/" className="hover:text-yellow-400 transition">
                    Domov
                </Link>
                <Link href="/profil" className="hover:text-yellow-400 transition">
                    Profil
                </Link>
                <button onClick={handleLogout}
                        className="hover:text-yellow-400 transition"
                >
                    Odjava
                </button>
            </nav>

            <div className="text-sm text-gray-300">
                Število točk: <span className="text-white font-semibold">0</span>
            </div>
        </header>

    );
}
