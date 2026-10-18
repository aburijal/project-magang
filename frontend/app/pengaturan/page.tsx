"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { defaultSystemSettings, loadSystemSettings, saveSystemSettings, SystemSettings } from "@/lib/system-settings";

export default function PengaturanPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings);

  useEffect(() => {
    // localStorage hanya tersedia di browser, sehingga konfigurasi perlu disinkronkan setelah mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSystemSettings());
  }, []);

  function updateSetting<Key extends keyof SystemSettings>(key: Key, value: SystemSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveSystemSettings(settings);
    setSaved(true);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Konfigurasi aplikasi</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Pengaturan Sistem</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Kelola identitas resmi dan format laporan yang digunakan pada dokumen PDF.</p></div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5"><h2 className="font-semibold text-slate-900">Identitas instansi</h2><p className="mt-1 text-sm text-slate-500">Informasi ini akan tampil pada header laporan.</p></div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">Nama instansi<input value={settings.institutionName} onChange={(event) => updateSetting("institutionName", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <label className="block text-sm font-medium text-slate-700">Nama aplikasi<input value={settings.applicationName} onChange={(event) => updateSetting("applicationName", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">Unit pengelola<input value={settings.managingUnit} onChange={(event) => updateSetting("managingUnit", event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          </div>
        </section>
        <div className="flex items-center gap-3"><button type="button" onClick={handleSave} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Simpan Pengaturan</button>{saved && <span className="text-sm font-medium text-emerald-600">Pengaturan berhasil disimpan.</span>}</div>
      </div>
    </AppLayout>
  );
}
