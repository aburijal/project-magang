"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function PengaturanPage() {
  const [saved, setSaved] = useState(false);
  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Konfigurasi</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Pengaturan Sistem</h1></div>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-900">Identitas Pemerintah Daerah</h2><div className="mt-5 space-y-4"><label className="block text-sm font-medium text-slate-700">Nama instansi<input defaultValue="Pemerintah Kota Lhokseumawe" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" /></label><label className="block text-sm font-medium text-slate-700">Nama aplikasi<input defaultValue="Katalog Aset Tanah" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" /></label><label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" /> Aktifkan indikator sinkronisasi realtime</label></div><div className="mt-6 flex items-center gap-3"><button type="button" onClick={() => setSaved(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Simpan Perubahan</button>{saved && <span className="text-sm text-emerald-600">Pengaturan berhasil disimpan.</span>}</div></section>
      </div>
    </AppLayout>
  );
}
