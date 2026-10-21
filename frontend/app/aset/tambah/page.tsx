"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { addAsset, loadAssets } from "@/lib/asset-storage";
import { addDocument } from "@/lib/document-storage";
import { findDuplicateAsset } from "@/lib/asset-import";
import { uniquePhotos } from "@/lib/photo-utils";
import { Asset } from "@/types/asset";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]";

export default function TambahAsetPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isReadingPhotos, setIsReadingPhotos] = useState(false);
  const [denahPhoto, setDenahPhoto] = useState("");
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);

  function readFiles(files: FileList | null): Promise<string[]> {
    if (!files?.length) return Promise.resolve([]);

    return Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(`Foto ${file.name} tidak dapat dibaca.`));
      reader.readAsDataURL(file);
    })));
  }

  async function handleDenahChange(event: ChangeEvent<HTMLInputElement>) {
    setIsReadingPhotos(true);
    setError("");
    try {
      const [photo] = await readFiles(event.target.files);
      setDenahPhoto(photo ?? "");
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Denah tidak dapat dibaca.");
    } finally {
      setIsReadingPhotos(false);
      event.target.value = "";
    }
  }

  async function handleAdditionalPhotosChange(event: ChangeEvent<HTMLInputElement>) {
    setIsReadingPhotos(true);
    setError("");
    try {
      const photos = await readFiles(event.target.files);
      setAdditionalPhotos((current) => [...current, ...photos]);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Foto tidak dapat dibaca.");
    } finally {
      setIsReadingPhotos(false);
      event.target.value = "";
    }
  }

  function removeAdditionalPhoto(index: number) {
    setAdditionalPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("nama") ?? "").trim();
    const address = String(form.get("alamat") ?? "").trim();
    const district = String(form.get("kecamatan") ?? "");
    const areaValue = String(form.get("luas") ?? "");

    if (!name || !address || !district) {
      setError("Lengkapi nama aset, alamat, dan kecamatan.");
      return;
    }
    if (!denahPhoto) {
      setError("Upload denah lokasi aset terlebih dahulu.");
      return;
    }
    if (isReadingPhotos) {
      setError("Tunggu sampai semua foto selesai diproses.");
      return;
    }

    const assets = loadAssets();
    const nextNumber = Math.max(0, ...assets.map((asset) => asset.no)) + 1;
    const nextAssetId = Date.now();
    const today = new Date().toLocaleDateString("id-ID");
    const certificateNumber = String(form.get("no_sertifikat") ?? "").trim();
    const selectedCertificateStatus = String(form.get("status_sertifikat") ?? "Keterangan Lainnya");

    const nextAsset: Asset = {
      id: nextAssetId,
      no: nextNumber,
      no_register: String(form.get("register") ?? "-").trim() || "-",
      nama_barang_aset: name,
      dinas_opd: String(form.get("opd") ?? "").trim() || "Contoh Dinas Lingkungan Hidup",
      lokasi_aset: `Kecamatan ${district}`,
      alamat: address,
      luas_m2: areaValue ? Number(areaValue) : null,
      tanggal_perolehan: String(form.get("tanggal") ?? "").trim() || today,
      hak: String(form.get("hak") ?? "Hak Pakai"),
      tanggal_sertifikat: certificateNumber ? today : "-",
      no_sertifikat: certificateNumber || "-",
      status_sertifikat: certificateNumber ? "Bersertifikat" : selectedCertificateStatus as "Belum Bersertifikat" | "Keterangan Lainnya",
      penggunaan: String(form.get("penggunaan") ?? "").trim() || "-",
      asal_usul: String(form.get("asal_usul") ?? "Pembelian"),
      nilai_perolehan: Number(form.get("nilai") ?? 0) || null,
      keterangan: String(form.get("keterangan") ?? "").trim() || "-",
      keterangan_di_lapangan: "",
      koordinat_x: Number(form.get("latitude") ?? 0) || null,
      koordinat_y: Number(form.get("longitude") ?? 0) || null,
    };
    const duplicate = findDuplicateAsset(nextAsset, assets);
    if (duplicate) {
      setError(`Aset "${duplicate.nama_barang_aset}" sudah terdaftar dengan nomor register atau nomor sertifikat yang sama. Tidak ada data atau foto yang ditambahkan.`);
      return;
    }
    const photos = await uniquePhotos([denahPhoto, ...additionalPhotos]);
    addAsset(nextAsset);
    addDocument({
      id: `document-${nextAssetId}`,
      assetId: nextAssetId,
      title: name,
      type: "Denah & Foto Aset",
      description: `Denah lokasi dan foto pendukung untuk ${name}.`,
      photos,
      createdAt: new Date().toISOString(),
    });

    router.push("/aset");
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <button type="button" onClick={() => router.back()} className="ui-button ui-button-outline text-sm font-medium text-blue-600">← Kembali ke Data Aset</button>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Tambah Aset Tanah</h1>
          <p className="mt-1 text-sm text-slate-500">Masukkan data aset tanah baru ke katalog inventaris.</p>
        </div>
        <form
  onSubmit={handleSubmit}
  className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
>
          <section>
           <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-[#193B5A]">Identitas Aset</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 md:col-span-2">Nama aset *<input name="nama" required className={inputClass} placeholder="Contoh: Tanah Kantor Kecamatan" /></label>
              <label className="text-sm font-medium text-slate-700">Kecamatan *<select name="kecamatan" required className={inputClass}><option value="">Pilih kecamatan</option><option>Banda Sakti</option><option>Muara Dua</option><option>Muara Satu</option><option>Blang Mangat</option></select></label>
              <label className="text-sm font-medium text-slate-700">Alamat / Gampong *<input name="alamat" required className={inputClass} placeholder="Contoh: Gampong ..." /></label>
              <label className="text-sm font-medium text-slate-700">Dinas / OPD<input name="opd" className={inputClass} placeholder="Contoh: Dinas Lingkungan Hidup" /></label>
              <label className="text-sm font-medium text-slate-700">Nomor register<input name="register" className={inputClass} placeholder="Contoh: 4" /></label>
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-slate-900">Denah dan Foto Aset</h2>
            <p className="mt-1 text-sm text-slate-500">Denah lokasi wajib diupload. Foto tambahan dapat dipilih lebih dari satu dan akan masuk ke menu Dokumen Aset.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
             <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#B8CDE0] bg-[#F4F8FC] p-8 text-center text-sm text-[#315F86] transition hover:border-[#315F86] hover:bg-[#E7EFF8]">
                <span className="font-semibold">Upload denah lokasi *</span>
                <span className="mt-1 block text-xs text-slate-500">Format gambar: JPG, PNG, atau WEBP</span>
                <input type="file" accept="image/*" required={!denahPhoto} onChange={handleDenahChange} className="sr-only" />
              </label>
             <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 transition hover:border-[#315F86] hover:bg-[#F4F8FC]">
                <span className="font-semibold">Tambah foto lainnya</span>
                <span className="mt-1 block text-xs text-slate-500">Bisa memilih beberapa foto sekaligus</span>
                <input type="file" accept="image/*" multiple onChange={handleAdditionalPhotosChange} className="sr-only" />
              </label>
            </div>
            {denahPhoto && (
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-[#D7E4F0] bg-[#F4F8FC] p-4">
                <img src={denahPhoto} alt="Pratinjau denah lokasi" className="h-20 w-28 rounded object-cover" />
                <div><p className="text-sm font-medium text-slate-800">Denah lokasi siap disimpan</p><p className="text-xs text-slate-500">Foto utama dokumen aset</p></div>
              </div>
            )}
            {additionalPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {additionalPhotos.map((photo, index) => (
                  <div key={`${photo.slice(0, 20)}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <img src={photo} alt={`Foto tambahan ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeAdditionalPhoto(index)} className="absolute right-1 top-1 hidden rounded-full bg-red-600 px-1.5 text-sm text-white group-hover:block" aria-label={`Hapus foto tambahan ${index + 1}`}>×</button>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="font-semibold text-slate-900">Data Tanah dan Legalitas</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">Luas (m²) <span className="font-normal text-slate-400">(opsional)</span><input name="luas" type="number" min="0" step="0.01" className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700">Tanggal perolehan<input name="tanggal" type="date" className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700">Status hak<select name="hak" className={inputClass}><option>Hak Pakai</option><option>Hak Milik</option><option>Hak Pengelolaan</option><option>HGB</option></select></label>
              <label className="text-sm font-medium text-slate-700">Nomor sertifikat<input name="no_sertifikat" className={inputClass} placeholder="Kosongkan bila belum ada" /></label>
              <label className="text-sm font-medium text-slate-700">Status sertifikat<select name="status_sertifikat" className={inputClass} defaultValue="Keterangan Lainnya"><option>Bersertifikat</option><option>Belum Bersertifikat</option><option>Keterangan Lainnya</option></select></label>
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
           <label className="mt-4 block text-sm font-medium text-slate-700">
  Keterangan
  <textarea
    name="keterangan"
    rows={3}
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
  />
</label>
          </section>
          {error &&<p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
         <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
  <button
    type="button"
    onClick={() => router.back()}
    className="ui-button-secondary rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
  >
    Batal
  </button>

  <button
    type="submit"
    disabled={isReadingPhotos}
    className="ui-button-primary rounded-xl bg-[#193B5A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#315F86] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isReadingPhotos ? "Memproses foto..." : "Simpan Aset"}
  </button>
</div>
        </form>
      </div>
    </AppLayout>
  );
}
