
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  defaultSystemSettings,
  loadSystemSettings,
  saveSystemSettings,
  SystemSettings,
} from "@/lib/system-settings";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] =
    useState<SystemSettings>(defaultSystemSettings);

  useEffect(() => {
    // Sinkronkan pengaturan setelah komponen dimuat di browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSystemSettings());
  }, []);

  function updateSetting<Key extends keyof SystemSettings>(
    key: Key,
    value: SystemSettings[Key],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveSystemSettings(settings);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-8 text-slate-800 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#315F86] transition hover:text-[#193B5A]"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Account
        </Link>

        <header className="relative mt-6 overflow-hidden rounded-3xl bg-[#193B5A] px-6 py-8 text-white sm:px-9 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-white/[0.05]" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              ACCOUNT CENTER
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Settings & Preference
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
              Kelola identitas instansi, format laporan PDF, dan preferensi
              sistem katalog aset tanah.
            </p>
          </div>
        </header>

        <div className="mt-7 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-[#D7E4F0] bg-[#F4F8FC] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7EFF8] text-[#315F86]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V7l7-4 7 4v14" />
                    <path d="M9 21v-6h6v6" />
                    <path d="M9 9h.01M15 9h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-[#193B5A]">
                    Identitas Instansi
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Informasi yang digunakan pada laporan.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <label className="block text-sm font-medium text-slate-700">
                Nama instansi
                <input
                  value={settings.institutionName}
                  onChange={(event) =>
                    updateSetting("institutionName", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Nama aplikasi
                <input
                  value={settings.applicationName}
                  onChange={(event) =>
                    updateSetting("applicationName", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Unit pengelola
                <input
                  value={settings.managingUnit}
                  onChange={(event) =>
                    updateSetting("managingUnit", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
                />
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-[#D7E4F0] bg-[#F4F8FC] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7EFF8] text-[#315F86]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M7 3h10l4 4v14H3V3h4Z" />
                    <path d="M7 3v6h10V3M7 21v-7h10v7" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-[#193B5A]">
                    Format Laporan PDF
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Atur ukuran kertas dan informasi pada laporan.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <label className="block text-sm font-medium text-slate-700">
                Ukuran kertas
                <select
                  value={settings.paperSize}
                  onChange={(event) =>
                    updateSetting(
                      "paperSize",
                      event.target.value as SystemSettings["paperSize"],
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
                >
                  <option value="a4">A4</option>
                  <option value="f4">F4</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Orientasi halaman
                <select
                  value={settings.orientation}
                  onChange={(event) =>
                    updateSetting(
                      "orientation",
                      event.target.value as SystemSettings["orientation"],
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
                >
                  <option value="portrait">Potret</option>
                  <option value="landscape">Lanskap</option>
                </select>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#B9CDDF] hover:bg-[#F8FAFD]">
                <input
                  type="checkbox"
                  checked={settings.showLogo}
                  onChange={(event) =>
                    updateSetting("showLogo", event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#315F86]"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Tampilkan logo
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Sertakan logo pada laporan jika didukung template PDF.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#B9CDDF] hover:bg-[#F8FAFD]">
                <input
                  type="checkbox"
                  checked={settings.showPrintDate}
                  onChange={(event) =>
                    updateSetting("showPrintDate", event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#315F86]"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Tampilkan tanggal cetak
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Sertakan tanggal pembuatan laporan.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#193B5A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#315F86] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
              >
                Simpan Pengaturan
              </button>

              {saved && (
                <p
                  role="status"
                  className="text-center text-sm font-medium text-emerald-700 sm:text-left"
                >
                  Pengaturan berhasil disimpan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
