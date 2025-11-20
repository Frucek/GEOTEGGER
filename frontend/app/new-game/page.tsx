"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLngLiteral } from "leaflet";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import MapPicker from "@/app/components/MapPicker";
import { createGame, isAuthenticated } from "@/app/lib/api";

export default function NovaIgraPage() {
  const [location, setLocation] = useState<LatLngLiteral | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!imageFile) {
      setError("Prosim izberite fotografijo.");
      return;
    }

    if (!location) {
      setError("Prosim kliknite na zemljevid, da določite lokacijo.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createGame({
        image: imageFile,
        latitude: location.lat,
        longitude: location.lng,
        title: title.trim() ? title.trim() : undefined,
        description: description.trim() ? description.trim() : undefined,
      });

      setSuccessMessage("Nova igra je bila uspešno ustvarjena!");
      setTitle("");
      setDescription("");
      setImageFile(null);
      setLocation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Prišlo je do napake pri shranjevanju igre.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-slate-900">Nova igra</h1>
          <p className="mt-2 text-slate-600">
            Naložite fotografijo in na zemljevidu označite lokacijo, kjer je
            bila posneta. Ostali igralci bodo poskušali uganiti pravilno točko.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-lg"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="image"
              className="text-sm font-semibold text-slate-700"
            >
              Fotografija
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setImageFile(file);
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {imageFile ? (
              <span className="text-xs text-slate-500">
                Izbrana datoteka: <strong>{imageFile.name}</strong>
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Podprte so vse slikovne datoteke (JPG, PNG, ...)
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Izberite lokacijo
            </span>
            <MapPicker value={location} onChange={setLocation} />
            <div className="text-sm text-slate-600">
              {location ? (
                <>
                  Izbrana točka: <strong>Lat {location.lat.toFixed(5)}</strong>,{" "}
                  <strong>Lon {location.lng.toFixed(5)}</strong>
                </>
              ) : (
                "Kliknite na zemljevid, da označite lokacijo."
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Shranjujem..." : "Ustvari igro"}
          </button>
        </form>
      </main>
    </>
  );
}
