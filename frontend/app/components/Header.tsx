"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { logoutUser, getCurrentUserId } from "@/app/lib/api";
import { useEffect, useState, useRef } from "react";

export default function Header() {
  const router = useRouter();
  const [points, setPoints] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    // Try to read points from localStorage first
    try {
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user && typeof user.points === "number") {
              setPoints(user.points);
            }
            if (user) {
              const name = user.email
                ? String(user.email).split("@")[0]
                : user.id
                ? String(user.id)
                : null;
              setUsername(name);
              if (name) {
                const parts = String(name)
                  .split(/[._\- ]+/)
                  .filter(Boolean);
                const letters = parts
                  .map((p) => p.charAt(0))
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                setInitials(letters || String(name).slice(0, 2).toUpperCase());
              }
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Fetch authoritative value from Supabase if we have a user id
    const userId = getCurrentUserId();
    if (userId) {
      (async () => {
        try {
          const resp = await supabase
            .from("users")
            .select("points")
            .eq("id", userId)
            .single();
          if (resp && resp.data && typeof resp.data.points === "number") {
            setPoints(resp.data.points);
          }
        } catch (e) {
          // ignore errors, keep local value
          console.error("Error fetching user points:", e);
        }
      })();
    }

    // Listen for updates dispatched elsewhere in the app
    const handler = (e: Event) => {
      try {
        // CustomEvent with detail containing points
        // @ts-ignore
        const value = e?.detail ?? null;
        if (typeof value === "number") setPoints(value);
        else if (value && typeof value.points === "number")
          setPoints(value.points);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener("user_points_updated", handler as EventListener);
    return () =>
      window.removeEventListener(
        "user_points_updated",
        handler as EventListener
      );
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!menuOpen) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(ev.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <header className="bg-gradient-to-r from-[#0f1724] to-[#16223b] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold tracking-wide">GT</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold">GEOTEGGER</div>
                <div className="text-xs text-sky-200/70">
                  Poišči skrite točke
                </div>
              </div>
            </Link>
          </div>

          {/* Middle: Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-4 text-sm text-sky-100">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/6 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-sky-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V10.5z"
                />
              </svg>
              <span>Domov</span>
            </Link>

            <Link
              href="/new-game"
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-sm hover:opacity-95 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Nova igra</span>
            </Link>
          </nav>

          {/* Right: Points + profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-slate-800/60 px-3 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-yellow-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 12h2m0 0h.01M12 3v1m0 16v1m9-9h-1M3 12H2m16.95 4.95l-.707-.707M6.757 6.757l-.707-.707M6.757 17.243l-.707.707M17.243 6.757l.707-.707"
                />
              </svg>
              <div className="text-xs text-sky-100/90">Število točk</div>
              <div className="text-sm font-semibold text-white">
                {points ?? 0}
              </div>
            </div>

            {/* Profile / Avatar + mobile menu button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800/70 px-3 py-1 rounded-full transition"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initials ?? "U"}
                </div>
                <div className="hidden sm:block text-sm text-sky-100/90">
                  {username ?? "Gost"}
                </div>
                <svg
                  className={`w-3 h-3 text-sky-200 transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900/80 backdrop-blur border border-white/10 shadow-lg py-2 z-40">
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/6"
                  >
                    Odjava
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger (only visible on small) */}
            <button
              className="md:hidden ml-2 p-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav overlay */}
        {menuOpen && (
          <div className="md:hidden mt-2 pb-4">
            <nav className="flex flex-col gap-2 bg-slate-900/80 rounded-lg p-3">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-sky-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V10.5z"
                  />
                </svg>
                Domov
              </Link>
              <Link
                href="/new-game"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded bg-sky-600 text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nova igra
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
