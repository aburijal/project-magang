
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthSession,
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  subscribeAuthSession,
} from "@/lib/auth-storage";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      setSession(loadAuthSession());
    };

    syncSession();

    const unsubscribe = subscribeAuthSession(syncSession);

    const storedTheme =
      window.localStorage.getItem("lhokseumawe-theme");
    const enabled = storedTheme === "dark";

    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);

    return unsubscribe;
  }, []);

  function toggleDarkMode() {
    setDarkMode((enabled) => {
      const nextEnabled = !enabled;

      document.documentElement.classList.toggle("dark", nextEnabled);
      window.localStorage.setItem(
        "lhokseumawe-theme",
        nextEnabled ? "dark" : "light",
      );

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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: String(form.get("email")),
          password: String(form.get("password")),
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        user?: AuthSession["user"];
        token?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok || !data.user || !data.token) {
        throw new Error(
          data.errors?.email?.[0] ||
            data.message ||
            "Login gagal. Periksa email dan password.",
        );
      }

      const nextSession: AuthSession = {
        token: data.token,
        user: data.user,
      };

      saveAuthSession(nextSession);
      setSession(nextSession);
      setShowLogin(false);
      setShowAccount(false);
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
  const currentSession = session;

  // Hapus sesi lokal agar UI langsung berubah.
  clearAuthSession();
  setSession(null);
  setShowAccount(false);
  setShowLogin(false);

  // Beri tahu backend bahwa sesi telah berakhir.
  if (currentSession) {
    try {
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    } catch (error) {
      console.error("Gagal menghubungi endpoint logout:", error);
    }
  }

  router.replace("/login");
}


  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur sm:h-20 lg:left-64">
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Buka menu navigasi"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              ☰
            </button>

            <div className="hidden h-8 w-1 rounded-full bg-blue-600 sm:block" />

            <div className="min-w-0">
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Portal inventaris daerah
              </p>
              <h1 className="truncate text-xs font-bold tracking-wide text-slate-800 sm:text-base">
                SISTEM KATALOG ASET TANAH
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-5">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={
                darkMode
                  ? "Aktifkan mode terang"
                  : "Aktifkan dark mode"
              }
              title={darkMode ? "Mode terang" : "Dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {darkMode ? "☀" : "☾"}
            </button>

            <div className="relative border-l border-slate-200 pl-2 sm:pl-5">
              <button
                type="button"
              onClick={() => {
  setShowAccount(false);
  setShowLogin(false);
  router.push("/account");
}}
                className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100 sm:gap-3"
              >
                
<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white sm:h-10 sm:w-10">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </svg>
</div>


              </button>

              {showAccount && session && (
                <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <p className="truncate px-2 text-sm font-medium text-slate-900">
                    {session.user.email}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

          {showLogin && (
        <div
          className="login-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogin(false);
              setLoginError("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            className="login-modal relative my-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:min-h-[580px] lg:grid-cols-2"
          >
            {/* PANEL IDENTITAS INSTANSI */}
            <div className="relative flex flex-col overflow-hidden bg-[#102747] p-6 text-white sm:p-9 lg:p-10">
              <div className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-12 top-36 h-44 w-44 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-white/10" />

              {/* Logo dapat diganti melalui public/images/logo-pemko.png */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
                  <img
                    src="/logo-pemko.png"
                    alt="Logo Pemko Lhokseumawe"
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      const fallback = event.currentTarget
                        .nextElementSibling;
                      if (fallback instanceof HTMLElement) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                  <div
                    className="hidden h-full w-full items-center justify-center text-[#102747]"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
                      <path
                        d="M5 34H35M9 31V17L20 9L31 17V31M15 31V22H25V31M5 17H35M20 4V9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                    Pemerintah Daerah
                  </p>
                  <p className="mt-1 text-sm font-bold tracking-wide">
                    KOTA LHOKSEUMAWE
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Portal Inventaris Daerah
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-9 sm:mt-12">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Sistem Informasi Terintegrasi
                </p>

                <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Digitalisasi
                  <br />
                  <span className="text-[#e5c783]">
                    Katalog Aset Tanah
                  </span>
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Platform pengelolaan data, dokumen, dan informasi aset tanah
                  pemerintah daerah yang terstruktur dan terintegrasi.
                </p>
              </div>

              {/* Ilustrasi gedung dan bidang tanah dengan animasi */}
              <div className="relative mx-auto mt-5 w-full max-w-sm flex-1 lg:mt-0 lg:min-h-[210px]">
                <svg
                  viewBox="0 0 400 250"
                  className="login-illustration h-full max-h-[260px] w-full"
                  role="img"
                  aria-label="Ilustrasi gedung pemerintahan dan pemetaan aset tanah"
                >
                  <defs>
                    <linearGradient id="login-roof" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f4dfad" />
                      <stop offset="100%" stopColor="#b58a43" />
                    </linearGradient>
                    <linearGradient id="login-building" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#a9c2dc" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M24 191L197 106L377 192L204 239Z"
                    fill="#1d4167"
                    stroke="#6485a6"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M52 191L197 121L350 192L204 228Z"
                    fill="none"
                    stroke="#7898b8"
                    strokeDasharray="5 5"
                  />
                  <path
                    d="M92 191L197 139L309 192L204 218Z"
                    fill="#2c5277"
                    stroke="#6485a6"
                  />

                  <g className="login-building-float">
                    <path d="M125 111L198 73L271 111L198 150Z" fill="url(#login-roof)" />
                    <path d="M125 111L198 150V207L125 169Z" fill="url(#login-building)" />
                    <path d="M198 150L271 111V169L198 207Z" fill="#91abc7" />
                    <path d="M137 111L198 80L259 111L198 143Z" fill="#f8fafc" />

                    <path d="M146 116L154 120V177L146 173Z" fill="#ffffff" />
                    <path d="M168 128L176 132V189L168 185Z" fill="#ffffff" />
                    <path d="M190 139L198 143V201L190 197Z" fill="#ffffff" />
                    <path d="M210 143L218 139V196L210 201Z" fill="#dce6f0" />
                    <path d="M232 131L240 127V184L232 188Z" fill="#dce6f0" />
                    <path d="M254 119L262 115V172L254 176Z" fill="#dce6f0" />

                    <path
                      d="M125 169L198 207L271 169"
                      fill="none"
                      stroke="#e5c783"
                      strokeWidth="2"
                    />
                  </g>

                  <g className="login-location-float">
                    <path
                      d="M314 60C314 46 325 36 339 36S364 46 364 60C364 78 339 101 339 101S314 78 314 60Z"
                      fill="#e5c783"
                    />
                    <circle cx="339" cy="60" r="9" fill="#102747" />
                    <circle cx="339" cy="60" r="4" fill="#e5c783" />
                  </g>

                  <g className="login-info-float">
                    <rect x="22" y="63" width="100" height="54" rx="9" fill="#ffffff" />
                    <rect x="32" y="74" width="21" height="21" rx="5" fill="#dce8fa" />
                    <path
                      d="M37 91V82L42.5 78L48 82V91M40 91V85H45V91"
                      stroke="#2457a7"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <rect x="60" y="77" width="50" height="5" rx="2.5" fill="#9eacc0" />
                    <rect x="60" y="88" width="37" height="4" rx="2" fill="#d2dbe6" />
                    <rect x="32" y="102" width="70" height="4" rx="2" fill="#e2e8f0" />
                  </g>

                  <circle
                    className="login-coordinate-pulse"
                    cx="85"
                    cy="174"
                    r="5"
                    fill="#e5c783"
                  />
                  <path
                    d="M85 174L120 194L148 179"
                    fill="none"
                    stroke="#e5c783"
                    strokeWidth="1.5"
                    strokeDasharray="4 5"
                  />
                </svg>
              </div>

              <div className="relative z-10 mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#e5c783]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 3L20 6V11C20 16 16.5 19.5 12 21C7.5 19.5 4 16 4 11V6L12 3Z" />
                    <path d="M9 12L11 14L15.5 9.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold">Akses Terproteksi</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Untuk pengguna terdaftar
                  </p>
                </div>
              </div>
            </div>

            {/* PANEL FORM LOGIN */}
            <div className="relative flex items-center justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12">
              <button
                type="button"
                aria-label="Tutup form login"
                onClick={() => {
                  setShowLogin(false);
                  setLoginError("");
                }}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
              >
                ×
              </button>

              <div className="w-full max-w-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Portal Akses
                </p>
                <h2
                  id="login-title"
                  className="mt-3 text-3xl font-bold tracking-tight text-slate-900"
                >
                  Selamat Datang
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Masuk menggunakan akun yang telah terdaftar untuk melanjutkan
                  ke sistem katalog aset tanah.
                </p>

                <form onSubmit={handleLogin} className="mt-8 space-y-5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Alamat Email
                    <div className="login-field mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <rect x="3" y="5" width="18" height="14" rx="3" />
                        <path d="M4 7L12 13L20 7" />
                      </svg>
                      <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="h-12 w-full bg-transparent text-sm font-normal text-slate-800 outline-none placeholder:text-slate-400"
                        placeholder="nama@instansi.go.id"
                      />
                    </div>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Kata Sandi
                    <div className="login-field mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <rect x="4" y="10" width="16" height="11" rx="2.5" />
                        <path d="M8 10V7A4 4 0 0 1 16 7V10" />
                        <path d="M12 14V17" />
                      </svg>
                      <input
                        id="modal-password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="h-12 w-full bg-transparent text-sm font-normal text-slate-800 outline-none placeholder:text-slate-400"
                        placeholder="Masukkan kata sandi"
                      />
                    </div>
                  </label>

                  {loginError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                    >
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="login-submit group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? "Memproses..." : "Masuk ke Sistem"}
                    {!isSubmitting && (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12H19M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isSubmitting && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                  </button>
                </form>

                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                    Sistem Informasi Daerah
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700">
                    Akses khusus pengguna terdaftar
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Gunakan akun yang diberikan administrator dan jaga
                    kerahasiaan kata sandi Anda.
                  </p>
                </div>

                <p className="mt-7 text-center text-[11px] leading-5 text-slate-400">
                  © 2026 Pemerintah Kota Lhokseumawe
                  <br />
                  Digitalisasi Katalog Aset Tanah
                </p>
              </div>
            </div>
          </section>

          <style jsx global>{`
            .login-modal {
              animation: login-modal-enter 450ms cubic-bezier(.2,.75,.3,1) both;
            }

            .login-building-float {
              transform-box: fill-box;
              transform-origin: center;
              animation: login-building-move 5s ease-in-out infinite;
            }

            .login-location-float {
              transform-box: fill-box;
              transform-origin: center;
              animation: login-pin-move 3.5s ease-in-out infinite;
            }

            .login-info-float {
              animation: login-info-move 4.5s ease-in-out infinite;
            }

            .login-coordinate-pulse {
              transform-box: fill-box;
              transform-origin: center;
              animation: login-pulse 2.5s ease-out infinite;
            }

            .login-field:focus-within {
              box-shadow: 0 0 0 4px rgb(59 130 246 / 10%);
            }

            .login-submit:focus-visible {
              outline: 3px solid rgb(59 130 246 / 35%);
              outline-offset: 3px;
            }

            @keyframes login-modal-enter {
              from { opacity: 0; transform: translateY(14px) scale(.99); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes login-building-move {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }

            @keyframes login-pin-move {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }

            @keyframes login-info-move {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }

            @keyframes login-pulse {
              0% { opacity: 1; transform: scale(.7); }
              70%, 100% { opacity: 0; transform: scale(2.8); }
            }

            @media (prefers-reduced-motion: reduce) {
              .login-modal,
              .login-building-float,
              .login-location-float,
              .login-info-float,
              .login-coordinate-pulse {
                animation: none !important;
              }

              .login-submit,
              .login-field {
                transition: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
