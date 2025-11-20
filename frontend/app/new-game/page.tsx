"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import type { LatLngLiteral } from "leaflet";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import MapPicker from "@/app/components/MapPicker";
import dynamic from "next/dynamic";
const MapPickerInnerFull = dynamic(
  () => import("@/app/components/MapPickerInnerFull"),
  { ssr: false }
);
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
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0] ?? null;
    if (file) setImageFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
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
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Nova igra</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Naložite fotografijo in označite lokacijo na zemljevidu. Ostali
            igralci bodo poskušali uganiti pravilno mesto.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white lg:h-[40rem]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full">
            {/* Left: full-bleed map half */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0">
                <MapPickerInnerFull value={location} onChange={setLocation} />
              </div>
              <div className="absolute left-4 top-4 bg-white/95 rounded-md px-3 py-1 text-xs text-slate-700 shadow">
                Označite lokacijo
              </div>
            </div>

            {/* Right: form */}
            <form
              onSubmit={handleSubmit}
              className="p-8 flex flex-col gap-6 lg:justify-center h-full"
            >
              {/* (Thumbnail moved to map overlay) */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Naslov igre
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Vnesite naslov (ni obvezno)"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Opis
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kratek opis (ni obvezno)"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm min-h-[6rem]"
                />
              </div>

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
                    Podprte so slike (JPG, PNG...)
                  </span>
                )}
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

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-sky-700 hover:to-sky-600 disabled:opacity-60"
                >
                  {isSubmitting ? "Shranjujem..." : "Ustvari igro"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    setImageFile(null);
                    setLocation(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-sm px-3 py-2 rounded-md border border-slate-200"
                >
                  Počisti
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
