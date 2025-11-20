import Image from "next/image";
import Link from "next/link";
import ClientGameFallback from "./ClientGameFallback";
import Header from "@/app/components/Header";

const API_BASE = process.env.BACKEND || "http://127.0.0.1:8000";

async function fetchGame(id: string) {
  const res = await fetch(`${API_BASE}/games/${encodeURIComponent(id)}`, {
    // don't cache to ensure fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    // try to parse JSON error body
    const err = await res.json().catch(() => ({}));
    const message =
      err.detail ||
      err.message ||
      res.statusText ||
      "Napaka pri nalaganju igre";
    throw new Error(message);
  }

  const data = await res.json();
  // backend returns the game object directly
  return data && data.id ? data : data.game || data;
}

export default async function GamePage({
  params,
}: {
  params: { id: string | string[] | number };
}) {
  // Normalize id: accept string, number or array of strings
  let rawId = params?.id as any;
  const id = Array.isArray(rawId)
    ? String(rawId[0])
    : rawId !== undefined && rawId !== null
    ? String(rawId)
    : "";

  if (!id) {
    // If server params are empty, fall back to client extraction
    return <ClientGameFallback />;
  }

  let game: any = null;
  try {
    game = await fetchGame(id);
  } catch (err: any) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-lg border border-red-300">
          {err?.message || "Napaka pri nalaganju igre"}
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="text-slate-600">Igra ni bila najdena.</div>
      </div>
    );
  }

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

  const imageUrl = (game.image_url || game.path || "")
    .toString()
    .replace("supabase.co//", "supabase.co/");

  return (
    <>
      <Header />
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {game.title}
            </h1>
            <p className="text-xs text-slate-400 mb-4">
              {game.created_at
                ? new Date(game.created_at).toLocaleString("sl-SI")
                : "Datum ni na voljo"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 font-semibold">Ustvaril</p>
                <p className="text-sm text-slate-500">
                  Uporabnik: {displayName}
                </p>
              </div>
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
    </>
  );
}
