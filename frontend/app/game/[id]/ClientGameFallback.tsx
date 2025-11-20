"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchGameById, checkGameLocation } from "@/app/lib/api";
import MapPicker from "@/app/components/MapPicker";

export default function ClientGameFallback() {
  const [game, setGame] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Map marker state (declare unconditionally to preserve Hooks order)
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [checking, setChecking] = useState(false);
  const [distanceResult, setDistanceResult] = useState<number | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFromLocation() {
      try {
        const path =
          typeof window !== "undefined" ? window.location.pathname : "";
        // path like /game/7 or /game/7/
        const parts = path.split("/").filter(Boolean);
        const id = parts.length ? parts[parts.length - 1] : "";
        if (!id) {
          setError("Neveljaven ID igre (client fallback).");
          return;
        }

        const data = await fetchGameById(id);
        const gameData = data && data.id ? data : data.game || data;
        setGame(gameData);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Napaka pri nalaganju igre (client)");
      } finally {
        setLoading(false);
      }
    }

    loadFromLocation();
  }, []);

  if (loading)
    return <div className="w-full flex justify-center py-10">Nalaganje...</div>;
  if (error)
    return (
      <div className="w-full flex justify-center py-10">
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-lg border border-red-300">
          {error}
        </div>
      </div>
    );
  if (!game)
    return (
      <div className="w-full flex justify-center py-10">
        Igra ni bila najdena.
      </div>
    );

  const imageUrl = (game.image_url || game.path || "")
    .toString()
    .replace("supabase.co//", "supabase.co/");

  // Compute display name from user_email if available, otherwise fallback to user_id
  let displayName = "-";
  try {
    if (game?.user_email) {
      const local = String(game.user_email).split("@")[0];
      displayName = local.split(".").join(" ");
    } else if (game?.user_id !== undefined && game?.user_id !== null) {
      displayName = String(game.user_id);
    }
  } catch (e) {
    displayName = String(game.user_id ?? "-");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-slate-500 mb-4 inline-block">
        ← Nazaj
      </Link>

      <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white">
        {imageUrl ? (
          <div className="relative h-80 w-full">
            <Image
              src={imageUrl}
              alt={game.title || "Game image"}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="sm:flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {game.title}
              </h1>
              <p className="text-xs text-slate-400">
                {game.created_at
                  ? new Date(game.created_at).toLocaleString("sl-SI")
                  : "Datum ni na voljo"}
              </p>
            </div>

            <div className="sm:w-48 text-right">
              <p className="text-sm text-slate-600 font-semibold">Ustvaril</p>
              <p className="text-sm text-slate-500">Uporabnik: {displayName}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-600 font-semibold mb-2">
              Označi lokacijo
            </p>
            <MapPicker
              value={marker}
              onChange={(val) => {
                if (!val) return setMarker(null);
                setMarker({ lat: val.lat, lng: val.lng });
                setDistanceResult(null);
                setCheckError(null);
              }}
              className="mb-4"
            />

            <div className="flex items-center gap-3">
              <button
                disabled={!marker || checking}
                onClick={async () => {
                  if (!marker) return;
                  setChecking(true);
                  setCheckError(null);
                  try {
                    const res = await checkGameLocation(
                      String(game.id ?? game.game?.id ?? ""),
                      marker.lat,
                      marker.lng
                    );
                    setDistanceResult(res.distance_meters ?? null);
                  } catch (err: any) {
                    console.error(err);
                    setCheckError(
                      err?.message || "Napaka pri preverjanju lokacije"
                    );
                  } finally {
                    setChecking(false);
                  }
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50"
              >
                {checking ? "Preverjam..." : "Preveri lokacijo"}
              </button>

              <div className="text-sm text-slate-600">
                {marker ? (
                  <div>
                    Izbrano: {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                  </div>
                ) : (
                  <div>Klikni na zemljevid, da označiš lokacijo.</div>
                )}
              </div>
            </div>

            {distanceResult !== null && (
              <div className="mt-3 text-sm">
                Rezultat: <strong>{Math.round(distanceResult)} m</strong>
              </div>
            )}

            {checkError && (
              <div className="mt-3 text-sm text-red-600">{checkError}</div>
            )}
          </div>

          {game.description ? (
            <div className="mt-6">
              <p className="text-sm text-slate-600 font-semibold">Opis</p>
              <p className="text-sm text-slate-500">{game.description}</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
