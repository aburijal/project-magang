"use client";

import { useState } from "react";

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-20 border-b border-slate-200 bg-white lg:left-64">
      <div className="flex h-full items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden h-9 w-1 rounded-full bg-blue-600 sm:block" />
          <h1 className="text-sm font-bold tracking-wide text-slate-800 sm:text-base">
            SISTEM DIGITAL KATALOG INVENTARIS ASET TANAH
          </h1>
        </div>

        {/* Bagian kanan */}
        <div className="flex items-center gap-5">
          {/* Notification */}
          <div className="relative">
            <button
              type="button"
              aria-label="Buka notifikasi"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((visible) => !visible)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              <span className="text-base">🔔</span>
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="font-semibold text-slate-900">Notifikasi</p>
                <p className="mt-1 text-xs text-slate-500">3 pembaruan katalog terbaru</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p className="rounded-lg bg-blue-50 px-3 py-2">Data aset siap ditinjau.</p>
                  <p className="rounded-lg bg-orange-50 px-3 py-2">2 dokumen belum lengkap.</p>
                </div>
              </div>
            )}
          </div>

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