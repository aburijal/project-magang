
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AuthSession,
  loadAuthSession,
  subscribeAuthSession,
  clearAuthSession,
} from "@/lib/auth-storage";

export default function AccountInformationPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const syncSession = () => setSession(loadAuthSession());

    syncSession();
    setMounted(true);

    return subscribeAuthSession(syncSession);
  }, []);

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus sesi akun dari perangkat ini? Anda akan keluar dari akun.",
    );

    if (!confirmed) return;

    clearAuthSession();
    window.location.href = "/account/information";
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#F4F7FB] p-5">
        <div className="mx-auto max-w-3xl animate-pulse rounded-2xl bg-white p-8">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="mt-5 h-20 rounded-xl bg-slate-100" />
        </div>
      </main>
    );
  }

  const user = session?.user;

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-8 text-slate-800 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#315F86] transition hover:text-[#193B5A]"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Account
        </Link>

        <header className="mb-7 mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#315F86]">
            ACCOUNT CENTER
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#193B5A]">
            Account Information
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Informasi profil dan status akun Anda.
          </p>
        </header>

        {user ? (
          <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-[#193B5A] px-6 py-7 text-white sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold uppercase">
                    {user.name.trim().charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold">
                      {user.name}
                    </h2>

                    <p className="mt-1 break-all text-sm text-blue-100">
                      {user.email}
                    </p>

                    <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                      {user.role === "admin" ? "Administrator" : "Pengguna"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 p-6 sm:p-8">
                <h3 className="mb-4 text-base font-bold text-[#193B5A]">
                  Detail Akun
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Nama lengkap
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                      {user.name}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Email
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                      {user.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      ID Pengguna
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {user.id}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Status akun
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Session tersimpan
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>

                Hapus Akun
              </button>
            </div>

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              Tindakan ini akan mengeluarkan akun dari perangkat ini, bukan
              menghapus akun secara permanen.
            </p>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7EFF8] text-[#315F86]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#193B5A]">
              Anda belum login
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Silakan masuk ke akun untuk melihat informasi profil dan detail
              akun Anda.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#193B5A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#315F86] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
            >
              Login sekarang
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
