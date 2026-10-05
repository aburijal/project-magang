"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/peta": "Peta Aset Tanah",
  "/aset": "Data Aset Tanah",
  "/dokumen": "Dokumen Aset",
  "/pengguna": "Pengguna",
  "/pengaturan": "Pengaturan",
};

export default function Topbar() {
  const pathname = usePathname();

  const title = pageTitles[pathname] ?? "Sistem Inventaris Aset Tanah";

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-20 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Judul halaman */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {title}
          </h2>

          <p className="text-sm text-slate-500">
            Sistem Digital Katalog Inventaris Aset Tanah
          </p>
        </div>

        {/* Bagian kanan */}
        <div className="flex items-center gap-5">
          {/* Notification */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <span className="text-lg">🔔</span>

            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Admin
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}