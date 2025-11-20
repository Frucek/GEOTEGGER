"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchGameById,
  checkGameLocation,
  getCurrentUserId,
} from "@/app/lib/api";
import MapPicker from "@/app/components/MapPicker";
import Header from "@/app/components/Header";

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
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);

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

  // Creator initials for avatar
  const creatorInitials = (() => {
    try {
      return String(displayName || "")
        .split(" ")
        .map((s) => (s ? s.charAt(0) : ""))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    } catch (e) {
      return "";
    }
  })();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-10 py-16">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-sm text-slate-500 inline-block">
            ← Nazaj
          </Link>
          <div className="text-sm text-slate-400">
            Igra:{" "}
            <span className="font-medium text-slate-700">{game.title}</span>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative h-[30rem] lg:h-auto">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={game.title || "Game image"}
                  fill
                  className="object-cover lg:object-cover h-full w-full"
                />
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                  Brez slike
                </div>
              )}
              <div className="absolute left-4 top-4 bg-white/80 backdrop-blur rounded-md px-3 py-1 text-xs text-slate-700">
                {game.created_at
                  ? new Date(game.created_at).toLocaleString("sl-SI")
                  : "Datum ni na voljo"}
              </div>

              {distanceResult !== null && (
                <div className="absolute left-4 right-4 bottom-4">
                  <div
                    role="status"
                    className="w-full rounded-lg bg-gradient-to-r from-sky-50 to-white border border-sky-200 px-4 py-3 shadow-md flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs text-sky-500">Rezultat</div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {Math.round(distanceResult)} m
                      </div>
                      {pointsAwarded !== null && (
                        <div className="text-sm text-slate-600 mt-1">
                          Točke:{" "}
                          <span className="font-semibold">
                            +{pointsAwarded}
                          </span>
                          {totalPoints !== null && (
                            <span className="text-slate-500">
                              {" "}
                              (skupaj: {totalPoints})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {distanceResult <= 50 ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          Zelo blizu
                        </span>
                      ) : distanceResult <= 200 ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          Blizu
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                          Dalj od cilja
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  {game.title}
                </h1>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-xs">
                      {creatorInitials || "U"}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">
                        Ustvaril
                      </div>
                      <div className="text-sm font-medium text-slate-800">
                        {displayName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {game.description ? (
                  <div className="prose text-sm text-slate-700">
                    {game.description}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Brez opisa</div>
                )}
              </div>

              <div>
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
                    setPointsAwarded(null);
                    setTotalPoints(null);
                  }}
                  className="mb-3 rounded-md overflow-hidden"
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
                          marker.lng,
                          getCurrentUserId()
                        );
                        setDistanceResult(res.distance_meters ?? null);
                        setPointsAwarded(res.points_awarded ?? null);
                        setTotalPoints(res.total_points ?? null);

                        // Update localStorage 'user' object points (if present)
                        try {
                          if (typeof window !== "undefined") {
                            const userStr = localStorage.getItem("user");
                            if (userStr) {
                              try {
                                const userObj = JSON.parse(userStr);
                                if (
                                  res.total_points !== undefined &&
                                  res.total_points !== null
                                ) {
                                  userObj.points = res.total_points;
                                  localStorage.setItem(
                                    "user",
                                    JSON.stringify(userObj)
                                  );
                                  // Notify other components in same window
                                  try {
                                    const ev = new CustomEvent(
                                      "user_points_updated",
                                      { detail: res.total_points }
                                    );
                                    window.dispatchEvent(ev);
                                  } catch (e) {
                                    // ignore
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
                      } catch (err: any) {
                        console.error(err);
                        setCheckError(
                          err?.message || "Napaka pri preverjanju lokacije"
                        );
                      } finally {
                        setChecking(false);
                      }
                    }}
                    aria-disabled={!marker || checking}
                    className={
                      `inline-flex items-center gap-3 px-4 py-2 rounded-lg text-white font-semibold shadow-lg transition-transform transform ` +
                      `focus:outline-none focus:ring-2 focus:ring-sky-300 ` +
                      `${
                        marker && !checking
                          ? "bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600"
                          : "bg-slate-300 text-slate-600 cursor-not-allowed"
                      } ` +
                      `${checking ? "opacity-90" : ""}`
                    }
                  >
                    {checking ? (
                      // spinner
                      <svg
                        className="w-4 h-4 flex-none block animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      // simple target/bullseye icon
                      <svg
                        className="w-4 h-4 flex-none block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      </svg>
                    )}

                    <span className="sr-only">Preveri lokacijo</span>
                    <span className="pointer-events-none">
                      {checking ? "Preverjam..." : "Preveri lokacijo"}
                    </span>
                  </button>

                  <div className="text-sm text-slate-600">
                    {marker ? (
                      <div>
                        Izbrano: {marker.lat.toFixed(5)},{" "}
                        {marker.lng.toFixed(5)}
                      </div>
                    ) : (
                      <div>Klikni na zemljevid, da označiš lokacijo.</div>
                    )}
                  </div>
                </div>

                {checkError && (
                  <div className="mt-3 text-sm text-red-600">{checkError}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
