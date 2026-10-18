"use client";

import Link from "next/link";
import Image from "next/image";
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
    name: "Pengaturan",
    href: "/pengaturan",
    icon: "⚙",
  },
];

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileMenuOpen && <button type="button" aria-label="Tutup menu navigasi" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" />}
    <aside className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col bg-slate-900 text-white shadow-2xl transition-transform duration-200 lg:z-40 lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700 px-4 sm:h-20 sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-lg shadow-blue-950/30">
          <Image
            src="/logo-pemko.png"
            alt="Logo Pemerintah Kota Lhokseumawe"
            width={44}
            height={44}
            className="h-full w-full object-contain"
            priority
          />
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
              onClick={onClose}
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
    </>
  );
}