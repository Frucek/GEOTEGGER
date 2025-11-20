"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchGames } from "@/app/lib/api";

export default function Games() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await fetchGames();
        console.log(data);
        setGames(data);
      } catch (err) {
        setError("Napaka pri nalaganju iger.");
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="text-lg font-semibold text-slate-600">Nalaganje...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-lg border border-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Igre</h1>

      {games.length === 0 ? (
        <p className="text-slate-600">Ni ustvarjenih iger.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-slate-200 bg-white"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={game.image_url.replace("supabase.co//", "supabase.co/")}
                  alt="Game image"
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>

              <div className="p-4 flex flex-col gap-2">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold">{game.title}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(game.created_at).toLocaleDateString("sl-SI")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
