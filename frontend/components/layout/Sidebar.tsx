"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Peta Aset Tanah",
    href: "/peta",
    icon: "🗺",
  },
  {
    name: "Data Aset Tanah",
    href: "/aset",
    icon: "📦",
  },
  {
    name: "Dokumen Aset",
    href: "/dokumen",
    icon: "📄",
  },
  {
    name: "Pengguna",
    href: "/pengguna",
    icon: "👤",
  },
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: "⚙",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-white max-lg:hidden">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-700 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-950/30">
          K
        </div>

        <div className="ml-3">
          <h1 className="text-xs font-bold leading-4">
            SISTEM DIGITAL KATALOG
            <br />
            INVENTARIS ASET TANAH
          </h1>

          <p className="text-xs text-slate-400">
            Pemko Lhokseumawe
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu Utama
        </p>

        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-3 text-sm transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="mr-3 w-5 text-center text-base">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <p className="text-[11px] leading-4 text-slate-500">
          Pemerintah Kota Lhokseumawe
          <br />
          Dinas Pertanahan · 2026
        </p>
      </div>
    </aside>
  );
}