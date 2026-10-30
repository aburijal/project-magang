
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F2F5F9] px-4 py-8 sm:px-6 lg:px-10">
      {/* Dekorasi latar */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#DCE6F1] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#E6EAF0] opacity-70 blur-3xl" />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,35,65,0.12)] lg:min-h-[650px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Panel identitas aplikasi */}
        <div className="relative flex flex-col overflow-hidden bg-[#102747] px-7 py-10 text-white sm:px-12 sm:py-12 lg:px-14 lg:py-14">
          {/* Ornamen geometris */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-[#D5B36A]/30" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white p-2 shadow-lg">
              <Image
                src="/logo-pemko.png"
                alt="Logo Pemerintah Kota Lhokseumawe"
                width={64}
                height={64}
                priority
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E1C783]">
                Pemerintah Kota
              </p>
              <h1 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
                Lhokseumawe
              </h1>
              <p className="mt-1 text-xs text-slate-300">
                Sistem Informasi Aset Daerah
              </p>
            </div>
          </div>

          <div className="relative z-10 my-9 h-px w-full bg-gradient-to-r from-[#D5B36A] via-white/20 to-transparent lg:my-12" />

          <div className="relative z-10 flex flex-1 flex-col justify-center py-2">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#D5B36A]/30 bg-[#D5B36A]/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#D5B36A]" />
              <span className="text-xs font-medium tracking-wide text-[#F0DCA9]">
                DIGITALISASI ASET DAERAH
              </span>
            </div>

            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
              Kelola Aset Tanah
              <span className="mt-2 block text-[#E1C783]">
                Lebih Terintegrasi.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Sistem digitalisasi katalog aset tanah untuk mendukung
              pengelolaan data pertanahan yang tertata, informatif, dan
              mudah diakses sesuai kewenangan.
            </p>

            <div className="mt-9 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#D5B36A]/15 text-[#E1C783]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M3 10.5 12 4l9 6.5" />
                    <path d="M5.5 9.5V20h13V9.5M9 20v-6h6v6" />
                  </svg>
                </div>
                <p className="text-sm font-semibold">Data Terpusat</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Informasi aset dalam satu sistem.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#D5B36A]/15 text-[#E1C783]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M12 3 19 6v5c0 4.5-2.8 7.5-7 10-4.2-2.5-7-5.5-7-10V6l7-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <p className="text-sm font-semibold">Akses Terkontrol</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Hak akses sesuai peran pengguna.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 border-t border-white/10 pt-5">
            <p className="text-xs leading-6 text-slate-400">
              Digitalisasi Katalog Aset Tanah
              <span className="mx-2 text-[#D5B36A]">•</span>
              Kota Lhokseumawe
            </p>
          </div>
        </div>

        {/* Panel formulir login */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#102747] text-[#E1C783]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A7833D]">
                Selamat Datang
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102747] sm:text-4xl">
                Masuk ke Akun
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Silakan masuk menggunakan akun yang telah terdaftar untuk
                mengakses katalog aset tanah.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 transition focus-within:border-[#A7833D] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#D5B36A]/15">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5 shrink-0 text-slate-400 group-focus-within:text-[#A7833D]"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@instansi.go.id"
                    required
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 transition focus-within:border-[#A7833D] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#D5B36A]/15">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5 shrink-0 text-slate-400 group-focus-within:text-[#A7833D]"
                    aria-hidden="true"
                  >
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                    className="shrink-0 rounded-md p-1 text-slate-400 transition hover:text-[#102747] focus:outline-none focus:ring-2 focus:ring-[#D5B36A]"
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M3 3 21 21" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a16 16 0 0 1-3.1 3.9M6.2 6.2C4.1 7.7 3 10 3 12c0 0 3.5 7 9 7 1.2 0 2.3-.3 3.3-.8" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5m0 3h.01" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102747] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#102747]/15 transition duration-200 hover:bg-[#19395F] hover:shadow-xl hover:shadow-[#102747]/20 focus:outline-none focus:ring-4 focus:ring-[#D5B36A]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke Sistem
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#E7D8B5] bg-[#FCFAF5] p-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="mt-0.5 h-5 w-5 shrink-0 text-[#A7833D]"
                aria-hidden="true"
              >
                <path d="M12 3 19 6v5c0 4.5-2.8 7.5-7 10-4.2-2.5-7-5.5-7-10V6l7-3Z" />
                <path d="M12 8v4m0 3h.01" />
              </svg>
              <p className="text-xs leading-5 text-slate-600">
                <span className="font-semibold text-[#102747]">
                  Informasi keamanan
                </span>
                <br />
                Gunakan akun resmi Anda dan jangan membagikan kata sandi
                kepada pihak lain.
              </p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs leading-5 text-slate-500">
                Sistem Digitalisasi Katalog Aset Tanah
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Pemerintah Kota Lhokseumawe
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
