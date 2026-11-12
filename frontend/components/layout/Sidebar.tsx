"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Peta Aset Tanah", href: "/peta", icon: "map" },
  { name: "Data Aset Tanah", href: "/aset", icon: "asset" },
  { name: "Dokumen Aset", href: "/dokumen", icon: "document" },
  { name: "Pengaturan", href: "/pengaturan", icon: "settings" },
] as const;

type IconName = (typeof menuItems)[number]["icon"];

function NavIcon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "dashboard")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );

  if (name === "map")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
        <path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </svg>
    );

  if (name === "asset")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="m4 12 8 4 8-4M4 17l8 4 8-4" />
      </svg>
    );

  if (name === "document")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    );

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  mobileMenuOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col border-r border-[#304c65] bg-[#193B5A] text-white shadow-xl transition-transform duration-200 lg:z-40 lg:w-64 lg:translate-x-0 lg:shadow-none ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Identitas instansi */}
        <div className="flex h-[84px] shrink-0 items-center border-b border-white/10 px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5">
            <Image
              src="/logo-pemko.png"
              alt="Logo Pemerintah Kota Lhokseumawe"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div className="ml-3 min-w-0">
            <h1 className="text-[11px] font-bold leading-5 tracking-[0.08em] text-white">
              KATALOG ASET TANAH
            </h1>
            <p className="mt-0.5 text-xs text-[#D0DCE7]">
              Pemko Lhokseumawe
            </p>
          </div>
        </div>

        {/* Navigasi */}
        <nav
          aria-label="Navigasi utama"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
        >
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B4C5D5]">
            Menu utama
          </p>

          {menuItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[#E7EFF8] text-[#193B5A]"
                    : "text-[#E0E8F0] hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#AD8748]" />
                )}

                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors ${
                    active
                      ? "bg-white text-[#315F86]"
                      : "bg-white/[0.07] text-[#D2DEE9] group-hover:bg-white/[0.13] group-hover:text-white"
                  }`}
                >
                  <span className="h-[19px] w-[19px]">
                    <NavIcon name={item.icon} />
                  </span>
                </span>

                <span className="flex-1">{item.name}</span>

                {active && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      d="m9 18 6-6-6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Informasi footer */}
        <div className="shrink-0 border-t border-white/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#E2C58A]">
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M3 9h18" />
              </svg>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-white">
                Pemerintah Kota Lhokseumawe
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#C0CFDC]">
                Sistem Informasi Aset Daerah
              </p>
              <p className="mt-2 text-[10px] text-[#9FB2C5]">
                © 2026 · Versi aplikasi
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
