"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getAsset } from "@/lib/asset-storage";

export default function DetailAsetPage() {
  const params = useParams<{ id: string }>();
  const asset = useMemo(() => getAsset(Number(params.id)), [params.id]);

  if (!asset) {
    return <AppLayout><div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">Aset tidak ditemukan.</div></AppLayout>;
  }

  const details = [
    ["Nomor register", asset.no_register],
    ["Dinas / OPD", asset.dinas_opd],
    ["Lokasi", asset.lokasi_aset],
    ["Alamat", asset.alamat],
    ["Luas", asset.luas_m2 ? `${asset.luas_m2.toLocaleString("id-ID")} m²` : "-"],
    ["Tanggal perolehan", asset.tanggal_perolehan],
    ["Hak", asset.hak],
    ["Nomor sertifikat", asset.no_sertifikat],
    ["Penggunaan", asset.penggunaan],
    ["Asal usul", asset.asal_usul],
    ["Nilai perolehan", asset.nilai_perolehan ? `Rp ${asset.nilai_perolehan.toLocaleString("id-ID")}` : "-"],
    ["Keterangan", asset.keterangan],
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Link href="/aset" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Kembali ke Data Aset</Link><h1 className="mt-3 text-2xl font-bold text-slate-900">{asset.nama_barang_aset}</h1><p className="mt-1 text-sm text-slate-500">Detail inventaris aset tanah</p></div>
          <Link href={`/aset/${asset.id}/edit`} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Edit Aset</Link>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-900">{value}</p></div>)}</div>
          {asset.koordinat_x !== null && asset.koordinat_y !== null && <Link href={`/peta?asset=${asset.id}`} className="mt-5 inline-flex rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Lihat lokasi di peta</Link>}
        </section>
      </div>
    </AppLayout>
  );
}
