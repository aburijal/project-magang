"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    name: "Peta Aset Tanah",
    href: "/peta",
    icon: "map",
  },
  {
    name: "Data Aset Tanah",
    href: "/aset",
    icon: "asset",
  },
  {
    name: "Dokumen Aset",
    href: "/dokumen",
    icon: "document",
  },
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: "settings",
  },
];

type IconName = (typeof menuItems)[number]["icon"];

function NavIcon({ name }: { name: IconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "dashboard") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  if (name === "map") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>;
  if (name === "asset") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4M4 17l8 4 8-4" /></svg>;
  if (name === "document") return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3.5" /></svg>;
}

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileMenuOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileMenuOpen && <button type="button" aria-label="Tutup menu navigasi" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" />}
    <aside className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col bg-[#10243f] text-white shadow-2xl transition-transform duration-200 lg:z-40 lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/10 px-4 sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-lg shadow-slate-950/20">
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
          <h1 className="text-[11px] font-bold leading-4 tracking-wide">KATALOG ASET TANAH</h1>
          <p className="mt-0.5 text-[11px] text-slate-400">Pemko Lhokseumawe</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Navigasi utama
        </p>

        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-950/20"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
              onClick={onClose}
            >
              <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white"><NavIcon name={item.icon} /></span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
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