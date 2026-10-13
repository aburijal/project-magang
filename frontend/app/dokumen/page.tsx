"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { dummyAssets } from "@/data/dummy-assets";
import { loadAssets } from "@/lib/asset-storage";
import { getAssetStatus } from "@/lib/asset-utils";

export default function DokumenPage() {
  const [assets, setAssets] = useState(dummyAssets);

  useEffect(() => {
    const refresh = () => setAssets(loadAssets());
    refresh();
    window.addEventListener("assets-updated", refresh);
    return () => window.removeEventListener("assets-updated", refresh);
  }, []);

  const documents = assets.map((asset) => ({
    ...asset,
    status: getAssetStatus(asset),
    document: asset.no_sertifikat !== "-" ? `Sertifikat-${asset.no_sertifikat}.pdf` : "Belum tersedia",
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">ARSIP DIGITAL</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Dokumen Aset</h1>
          </div>
          <Link href="/aset" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Ke Data Aset
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total dokumen</p><p className="mt-2 text-2xl font-bold text-slate-900">{documents.filter((item) => item.status === "Bersertifikat").length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Perlu dilengkapi</p><p className="mt-2 text-2xl font-bold text-orange-600">{documents.filter((item) => item.status !== "Bersertifikat").length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Sumber data</p><p className="mt-2 text-2xl font-bold text-emerald-600">Terpusat</p></div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Aset</th><th className="px-5 py-3">Lokasi</th><th className="px-5 py-3">Dokumen sertifikat</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{documents.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-medium text-slate-900">{item.nama_barang_aset}</td><td className="px-5 py-4 text-slate-600">{item.alamat}</td><td className="px-5 py-4 text-slate-600">{item.document}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "Bersertifikat" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{item.status}</span></td><td className="px-5 py-4"><Link href={`/aset/${item.id}`} className="font-medium text-blue-600 hover:text-blue-700">Lihat detail</Link></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
