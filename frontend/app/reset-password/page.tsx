"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/app/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError("Vnesite svoj e-poštni naslov.");
      return;
    }
    if (!password || password !== confirm) {
      setError("Gesli se ne ujemata.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword(email, password);
      alert("Geslo uspešno posodobljeno!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0b1622]">
      <div className="bg-[#162032] p-10 rounded-2xl shadow-lg w-96 text-center border border-blue-400">
        <h2 className="text-white text-2xl font-bold mb-4">Ponastavi geslo</h2>

        <input
          type="email"
          placeholder="Vaš e-poštni naslov"
          className="w-full mb-3 p-2 rounded bg-transparent border border-gray-400 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Novo geslo"
          className="w-full mb-3 p-2 rounded bg-transparent border border-gray-400 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Potrdi geslo"
          className="w-full mb-3 p-2 rounded bg-transparent border border-gray-400 text-white"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-transparent border border-yellow-400 text-yellow-400 p-2 rounded hover:bg-yellow-400 hover:text-black transition"
        >
          {loading ? "Shranjujem..." : "Ponastavi geslo"}
        </button>
      </div>
    </div>
  );
}
