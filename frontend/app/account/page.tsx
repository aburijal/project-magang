
"use client";

import Link from "next/link";

const accountMenus = [
  {
    title: "Account Information",
    description: "Kelola informasi profil dan detail akun Anda.",
    category: "PROFILE",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20v-1.5a7 7 0 0 1 14 0V20H5Z" />
      </svg>
    ),
    href: "/account/information",
  },
  {
    title: "Settings & Preference",
    description: "Atur identitas instansi dan preferensi aplikasi.",
    category: "PREFERENCES",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.1.9-1.5 2.6-1.4-.5a8 8 0 0 1-1.8 1l-.3 1.5h-3l-.3-1.5a8 8 0 0 1-1.8-1l-1.4.5-1.5-2.6 1.1-.9a7 7 0 0 1 0-2l-1.1-.9 1.5-2.6 1.4.5a8 8 0 0 1 1.8-1l.3-1.5h3l.3 1.5a8 8 0 0 1 1.8 1l1.4-.5 1.5 2.6-1.1.9a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)" />
      </svg>
    ),
    href: "/account/settings",
  },
  {
    title: "Help Center",
    description: "Temukan panduan dan jawaban pertanyaan umum.",
    category: "SUPPORT",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.6 2.6 0 1 1 4.3 2c-1.2 1-1.8 1.3-1.8 3" />
        <path d="M12 17.5h.01" />
      </svg>
    ),
    href: "/account/help",
  },
  {
    title: "Login",
    description: "Masuk untuk mengakses fitur pengelolaan aset.",
    category: "AUTHENTICATION",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
      </svg>
    ),
    href: "/login",
  },
];

export default function AccountPage() {
  return (
<main className="min-h-screen bg-[#F4F7FB] pb-24 text-slate-800 sm:pb-0">
     <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#193B5A] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
                <path d="m3.5 7.5 8.5 4.3 8.5-4.3M12 12v8.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#193B5A]">Katalog Aset Tanah</p>
              <p className="text-xs text-slate-500">Pemerintah Kota Lhokseumawe</p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-[#315F86] hover:bg-[#F4F8FC] hover:text-[#193B5A]"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Halaman utama</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="relative mb-9 overflow-hidden rounded-3xl bg-[#193B5A] px-6 py-8 text-white shadow-sm sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-white/[0.04]" />

          <div className="relative max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              ACCOUNT CENTER
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pengaturan Akun
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Akses informasi akun, atur preferensi aplikasi, dan temukan
              bantuan penggunaan Sistem Katalog Aset Tanah.
            </p>
          </div>
        </header>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#193B5A]">
              Menu akun
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pilih menu yang ingin Anda buka.
            </p>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 sm:inline-block">
            4 menu tersedia
          </span>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {accountMenus.map((menu, index) => (
            <Link
              key={menu.title}
              href={menu.href}
             className="group relative flex min-h-[174px] flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(25,59,90,0.025)] transition duration-200 hover:-translate-y-1 hover:border-[#B9CDDF] hover:shadow-[0_12px_30px_rgba(25,59,90,0.09)] active:scale-[0.98] active:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#315F86] focus:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7EFF8] text-[#315F86] transition duration-200 group-hover:bg-[#193B5A] group-hover:text-white">
                  {menu.icon}
                </div>
                <span className="text-xs font-medium tabular-nums text-slate-400">
                  0{index + 1}
                </span>
              </div>

              <span className="text-[10px] font-bold tracking-[0.15em] text-[#63809B]">
                {menu.category}
              </span>
              <span className="mt-1.5 flex items-center justify-between gap-3 text-base font-bold text-[#193B5A]">
                {menu.title}
                <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#315F86]">
                  →
                </span>
              </span>
              <span className="mt-2 text-sm leading-5 text-slate-500">
                {menu.description}
              </span>
            </Link>
          ))}
        </section>

        
<footer className="mt-10 border-t border-slate-200 pt-5 text-center">
  <p className="text-xs text-slate-400">
    Sistem Digitalisasi Katalog Aset Tanah · Pemerintah Kota Lhokseumawe
  </p>
</footer>

<nav
  aria-label="Navigasi akun"
  className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(25,59,90,0.08)] backdrop-blur-md sm:hidden"
>
  <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
    {accountMenus.map((menu) => (
      <Link
        key={menu.title}
        href={menu.href}
        aria-label={menu.title}
        className="group flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[#315F86] transition duration-150 hover:bg-[#E7EFF8] active:scale-95 active:bg-[#D9E7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86]"
      >
        <span className="transition-transform duration-150 group-active:scale-90">
          {menu.icon}
        </span>
        <span className="max-w-full truncate text-[10px] font-semibold">
          {menu.title === "Account Information"
            ? "Account"
            : menu.title === "Settings & Preference"
              ? "Settings"
              : menu.title === "Help Center"
                ? "Help"
                : "Login"}
        </span>
      </Link>
    ))}
  </div>
</nav>

      </div>
    </main>
  );
}
