"use client";

import { FormEvent, useEffect, useState } from "react";
import { AuthSession, loadAuthSession, saveAuthSession, clearAuthSession } from "@/lib/auth-storage";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // localStorage hanya tersedia di browser, sehingga sesi perlu disinkronkan setelah mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(loadAuthSession());
    const storedTheme = window.localStorage.getItem("lhokseumawe-theme");
    const enabled = storedTheme === "dark";
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleDarkMode() {
    setDarkMode((enabled) => {
      const nextEnabled = !enabled;
      document.documentElement.classList.toggle("dark", nextEnabled);
      window.localStorage.setItem("lhokseumawe-theme", nextEnabled ? "dark" : "light");
      return nextEnabled;
    });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: String(form.get("email")),
          password: String(form.get("password")),
        }),
      });
      const data = await response.json() as { message?: string; user?: AuthSession["user"]; token?: string; errors?: Record<string, string[]> };

      if (!response.ok || !data.user || !data.token) {
        throw new Error(data.errors?.email?.[0] || data.message || "Login gagal. Periksa email dan password.");
      }

      const nextSession = { token: data.token, user: data.user };
      saveAuthSession(nextSession);
      setSession(nextSession);
      setShowLogin(false);
      event.currentTarget.reset();
    } catch (error) {
      setLoginError(
        error instanceof TypeError
          ? "Server login tidak dapat dihubungi. Jalankan backend Laravel pada port 8000."
          : error instanceof Error
            ? error.message
            : "Login gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    if (session) {
      try {
        await fetch(`${apiUrl}/logout`, {
          method: "POST",
          headers: { Accept: "application/json", Authorization: "Bearer " + session.token },
        });
      } catch (error) {
        console.error("Gagal menghubungi server saat logout.", error);
      }
    }
    clearAuthSession();
    setSession(null);
    setShowAccount(false);
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur sm:h-20 lg:left-64">
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={onMenuClick} aria-label="Buka menu navigasi" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-slate-700 hover:bg-slate-100 lg:hidden">
            ☰
          </button>
          <div className="hidden h-8 w-1 rounded-full bg-blue-600 sm:block" />
          <div className="min-w-0">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">Portal inventaris daerah</p>
          <h1 className="truncate text-xs font-bold tracking-wide text-slate-800 sm:text-base">
            SISTEM KATALOG ASET TANAH
          </h1>
          </div>
        </div>

        {/* Bagian kanan */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-5">
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Aktifkan mode terang" : "Aktifkan dark mode"}
            title={darkMode ? "Mode terang" : "Dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {darkMode ? "☀" : "☾"}
          </button>
          {/* User */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-5">
            <button type="button" onClick={() => session ? setShowAccount((visible) => !visible) : setShowLogin(true)} className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white sm:h-10 sm:w-10">
                {session ? session.user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{session?.user.name || "Masuk"}</p>
                <p className="text-xs text-slate-500">
  {!session
    ? "Pengunjung"
    : session.user.role === "admin"
      ? "Administrator"
      : "User biasa"}
</p>
              </div>
            </button>
            {showAccount && session && (
              <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <p className="truncate px-2 text-sm font-medium text-slate-900">{session.user.email}</p>
                <button type="button" onClick={handleLogout} className="mt-3 w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50">Keluar</button>
              </div>
            )}
          </div>
        </div>
      </div>
      </header>
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Akses sistem</p><h2 className="mt-1 text-xl font-bold text-slate-900">Masuk ke Katalog Aset</h2></div>
              <button type="button" aria-label="Tutup form login" onClick={() => { setShowLogin(false); setLoginError(""); }} className="text-xl text-slate-400 hover:text-slate-700">×</button>
            </div>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">Email<input name="email" type="email" required autoComplete="email" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" placeholder="nama@contoh.com" /></label>
              <label className="block text-sm font-medium text-slate-700">Password<input name="password" type="password" required autoComplete="current-password" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" placeholder="Masukkan password" /></label>
              {loginError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loginError}</p>}
              <button type="submit" disabled={isSubmitting} className="ui-button-primary w-full font-medium">{isSubmitting ? "Memproses..." : "Masuk"}</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}