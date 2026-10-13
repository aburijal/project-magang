"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getAsset, updateAsset } from "@/lib/asset-storage";

const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function EditAsetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const asset = useMemo(() => getAsset(Number(params.id)), [params.id]);
  const [error, setError] = useState("");

  if (!asset) return <AppLayout><div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">Aset tidak ditemukan.</div></AppLayout>;
  const currentAsset = asset;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("nama") ?? "").trim();
    const address = String(form.get("alamat") ?? "").trim();
    if (!name || !address) { setError("Nama aset dan alamat wajib diisi."); return; }
    updateAsset(currentAsset.id, {
      nama_barang_aset: name,
      alamat: address,
      dinas_opd: String(form.get("opd") ?? "").trim() || currentAsset.dinas_opd,
      penggunaan: String(form.get("penggunaan") ?? "").trim() || "-",
      keterangan: String(form.get("keterangan") ?? "").trim() || "-",
      luas_m2: Number(form.get("luas") ?? 0) || null,
      no_sertifikat: String(form.get("sertifikat") ?? "").trim() || "-",
    });
    router.push(`/aset/${currentAsset.id}`);
  }

  return <AppLayout><div className="mx-auto max-w-3xl space-y-6"><div><button type="button" onClick={() => router.back()} className="text-sm font-medium text-blue-600">← Kembali</button><h1 className="mt-3 text-2xl font-bold text-slate-900">Edit Aset Tanah</h1></div><form onSubmit={save} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><label className="block text-sm font-medium text-slate-700">Nama aset *<input name="nama" defaultValue={currentAsset.nama_barang_aset} className={inputClass} required /></label><label className="block text-sm font-medium text-slate-700">Alamat *<input name="alamat" defaultValue={currentAsset.alamat} className={inputClass} required /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Dinas / OPD<input name="opd" defaultValue={currentAsset.dinas_opd} className={inputClass} /></label><label className="text-sm font-medium text-slate-700">Luas (m²)<input name="luas" type="number" min="0" step="0.01" defaultValue={currentAsset.luas_m2 ?? ""} className={inputClass} /></label><label className="text-sm font-medium text-slate-700">Nomor sertifikat<input name="sertifikat" defaultValue={currentAsset.no_sertifikat === "-" ? "" : currentAsset.no_sertifikat} className={inputClass} /></label><label className="text-sm font-medium text-slate-700">Penggunaan<input name="penggunaan" defaultValue={currentAsset.penggunaan} className={inputClass} /></label></div><label className="block text-sm font-medium text-slate-700">Keterangan<textarea name="keterangan" defaultValue={currentAsset.keterangan} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500" /></label>{error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm">Batal</button><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">Simpan Perubahan</button></div></form></div></AppLayout>;
}
