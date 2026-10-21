"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth-storage";

interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
  };
  token: string;
  token_type: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!["admin", "user"].includes(result.user.role)) {
  throw new Error("Role akun tidak dikenali.");
}

saveAuthSession({
  token: result.token,
  user: {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
  },
});

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa koneksi backend.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Katalog Aset Tanah
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Masuk untuk mengelola data aset tanah.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Masukkan email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Sistem Digitalisasi Katalog Aset Tanah Lhokseumawe
        </p>
      </section>
    </main>
  );
}
