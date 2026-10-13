"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { addAsset, loadAssets } from "@/lib/asset-storage";

const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function TambahAsetPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("nama") ?? "").trim();
    const address = String(form.get("alamat") ?? "").trim();
    const district = String(form.get("kecamatan") ?? "");
    const areaValue = String(form.get("luas") ?? "");

    if (!name || !address || !district || !areaValue) {
      setError("Lengkapi nama aset, alamat, kecamatan, dan luas tanah.");
      return;
    }

    const assets = loadAssets();
    const nextNumber = Math.max(0, ...assets.map((asset) => asset.no)) + 1;
    const today = new Date().toLocaleDateString("id-ID");
    const certificateNumber = String(form.get("no_sertifikat") ?? "").trim();

    addAsset({
      id: Date.now(),
      no: nextNumber,
      no_register: String(form.get("register") ?? "-").trim() || "-",
      nama_barang_aset: name,
      dinas_opd: String(form.get("opd") ?? "").trim() || "BPKD -PPBMD",
      lokasi_aset: `Kecamatan ${district}`,
      alamat: address,
      luas_m2: Number(areaValue),
      tanggal_perolehan: String(form.get("tanggal") ?? "").trim() || today,
      hak: String(form.get("hak") ?? "Hak Pakai"),
      tanggal_sertifikat: certificateNumber ? today : "-",
      no_sertifikat: certificateNumber || "-",
      penggunaan: String(form.get("penggunaan") ?? "").trim() || "-",
      asal_usul: String(form.get("asal_usul") ?? "Pembelian"),
      nilai_perolehan: Number(form.get("nilai") ?? 0) || null,
      keterangan: String(form.get("keterangan") ?? "").trim() || "-",
      keterangan_di_lapangan: "",
      koordinat_x: Number(form.get("latitude") ?? 0) || null,
      koordinat_y: Number(form.get("longitude") ?? 0) || null,
    });

    router.push("/aset");
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <button type="button" onClick={() => router.back()} className="text-sm font-medium text-blue-600 hover:text-blue-700">← Kembali ke Data Aset</button>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Tambah Aset Tanah</h1>
          <p className="mt-1 text-sm text-slate-500">Masukkan data aset tanah baru ke katalog inventaris.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <section>
            <h2 className="font-semibold text-slate-900">Identitas Aset</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Nama aset *<input name="nama" required className={inputClass} placeholder="Contoh: Tanah Kantor Kecamatan" /></label>
              <label className="text-sm font-medium text-slate-700">Kecamatan *<select name="kecamatan" required className={inputClass}><option value="">Pilih kecamatan</option><option>Banda Sakti</option><option>Muara Dua</option><option>Muara Satu</option><option>Blang Mangat</option></select></label>
              <label className="text-sm font-medium text-slate-700">Alamat / Gampong *<input name="alamat" required className={inputClass} placeholder="Contoh: Gampong ..." /></label>
              <label className="text-sm font-medium text-slate-700">Dinas / OPD<input name="opd" className={inputClass} defaultValue="BPKD -PPBMD" /></label>
              <label className="text-sm font-medium text-slate-700">Nomor register<input name="register" className={inputClass} placeholder="Contoh: 4" /></label>
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900">Data Tanah dan Legalitas</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">Luas (m²) *<input name="luas" required type="number" min="0" step="0.01" className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700">Tanggal perolehan<input name="tanggal" type="date" className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700">Status hak<select name="hak" className={inputClass}><option>Hak Pakai</option><option>Hak Milik</option><option>Hak Pengelolaan</option><option>HGB</option></select></label>
              <label className="text-sm font-medium text-slate-700">Nomor sertifikat<input name="no_sertifikat" className={inputClass} placeholder="Kosongkan bila belum ada" /></label>
              <label className="text-sm font-medium text-slate-700">Penggunaan<input name="penggunaan" className={inputClass} placeholder="Contoh: Kantor pemerintahan" /></label>
              <label className="text-sm font-medium text-slate-700">Asal usul<select name="asal_usul" className={inputClass}><option>Pembelian</option><option>Hibah</option><option>Penyerahan</option><option>Lainnya</option></select></label>
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900">Lokasi Peta dan Nilai</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">Latitude<input name="latitude" type="number" step="any" className={inputClass} placeholder="5.18000" /></label>
              <label className="text-sm font-medium text-slate-700">Longitude<input name="longitude" type="number" step="any" className={inputClass} placeholder="97.14000" /></label>
              <label className="text-sm font-medium text-slate-700">Nilai perolehan<input name="nilai" type="number" min="0" className={inputClass} placeholder="Rp" /></label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">Keterangan<textarea name="keterangan" rows={3} className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500" /></label>
          </section>
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Simpan Aset</button></div>
        </form>
      </div>
    </AppLayout>
  );
}
