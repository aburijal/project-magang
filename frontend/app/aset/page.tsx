"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { dummyAssets } from "@/data/dummy-assets";
import { deleteAssetWithDocuments, loadAssets, saveAssets } from "@/lib/asset-storage";
import { addDocument } from "@/lib/document-storage";
import { getAssetStatus } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";
import { AssetImportPreview, previewAssetImport } from "@/lib/asset-import";

export default function AsetPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");
  const [district, setDistrict] = useState("Semua Kecamatan");
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);
  const [importPreview, setImportPreview] = useState<AssetImportPreview[] | null>(null);
  const [importError, setImportError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isReadingImport, setIsReadingImport] = useState(false);

  useEffect(() => {
    const refresh = () => setAssets(loadAssets());
    refresh();
    window.addEventListener("assets-updated", refresh);
    return () => window.removeEventListener("assets-updated", refresh);
  }, []);

  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const keyword = search.trim().toLowerCase();
    const searchable = [
      asset.nama_barang_aset,
      asset.no,
      asset.no_register,
      asset.dinas_opd,
      asset.lokasi_aset,
      asset.alamat,
    ].join(" ").toLowerCase();
    return searchable.includes(keyword) &&
      (status === "Semua Status" || getAssetStatus(asset) === status) &&
      (district === "Semua Kecamatan" || asset.lokasi_aset === district);
  }), [assets, search, status, district]);

  const districts = useMemo(
    () => Array.from(new Set(assets.map((asset) => asset.lokasi_aset).filter(Boolean))).sort(),
    [assets],
  );

  const certified = assets.filter((asset) => getAssetStatus(asset) === "Bersertifikat").length;
  const totalArea = assets.reduce((total, asset) => total + (asset.luas_m2 ?? 0), 0);

  function resetFilters() {
    setSearch("");
    setStatus("Semua Status");
    setDistrict("Semua Kecamatan");
  }

  function handleDelete(asset: Asset) {
    const confirmed = window.confirm(
      `Hapus aset "${asset.nama_barang_aset}" dari katalog?`,
    );
    if (!confirmed) return;

    setDeleteError("");
    try {
      deleteAssetWithDocuments(asset.id);
      setAssets(loadAssets());
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Aset dan dokumen terkait tidak dapat dihapus.");
    }
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportError("");
    setIsReadingImport(true);
    try {
      setImportPreview(await previewAssetImport(file, loadAssets()));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "File Excel tidak dapat dibaca.");
    } finally {
      setIsReadingImport(false);
    }
  }

  function confirmImport() {
    if (!importPreview) return;
    const validAssets = importPreview.flatMap((item) => item.error || !item.asset ? [] : [item.asset]);
    const photoItems = importPreview.filter((item) => item.asset && item.photos.length);
    if (!validAssets.length && !photoItems.length) {
      setImportError("Tidak ada data valid yang dapat ditambahkan.");
      return;
    }
    if (validAssets.length) saveAssets([...loadAssets(), ...validAssets]);
    photoItems
      .forEach((item) => addDocument({
        id: `import-${item.asset!.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        assetId: item.existingAssetId ?? item.asset!.id,
        title: `Dokumen foto - ${item.asset!.nama_barang_aset}`,
        type: "Foto Aset",
        description: "Foto diimpor dari file Excel.",
        photos: item.photos,
        createdAt: new Date().toISOString(),
      }));
    setAssets(loadAssets());
    setImportPreview(null);
    setImportError("");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Katalog inventaris</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Data Aset Tanah</h1>
            <p className="mt-1 text-sm text-slate-500">Kelola dan pantau seluruh aset tanah pemerintah daerah.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="ui-button ui-button-outline cursor-pointer border-blue-200 bg-blue-50 font-semibold text-blue-700 shadow-sm hover:bg-blue-100">
              {isReadingImport ? "Membaca Excel..." : "Import File Excel"}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} disabled={isReadingImport} className="hidden" />
            </label>
            <Link href="/aset/tambah" className="ui-button ui-button-primary font-semibold shadow-sm">
              + Tambah Aset
            </Link>
          </div>
        </div>
        {importError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{importError}</p>}
        {deleteError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}
        {importPreview && <section className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold text-slate-900">Preview Import Excel</h2><p className="text-sm text-slate-500">{importPreview.filter((item) => !item.error).length} baris baru, {importPreview.filter((item) => item.error).length} data identik atau ditolak.</p></div>
            <div className="flex gap-2"><button type="button" onClick={() => setImportPreview(null)} className="ui-button-secondary font-medium">Batal</button><button type="button" onClick={confirmImport} className="ui-button-primary font-medium">Tambahkan Data Valid</button></div>
          </div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Baris</th><th className="px-3 py-2">Nama aset</th><th className="px-3 py-2">Register</th><th className="px-3 py-2">Alamat</th><th className="px-3 py-2">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{importPreview.slice(0, 20).map((item) => <tr key={item.rowNumber}><td className="px-3 py-2 text-slate-500">{item.rowNumber}</td><td className="px-3 py-2 font-medium text-slate-800">{item.asset?.nama_barang_aset || "-"}</td><td className="px-3 py-2 text-slate-600">{item.asset?.no_register || "-"}</td><td className="px-3 py-2 text-slate-600">{item.asset?.alamat || "-"}</td><td className={`px-3 py-2 text-xs font-medium ${item.error ? "text-slate-500" : item.warning ? "text-amber-600" : "text-emerald-600"}`}>{item.error || item.warning || "Siap diimport"}</td></tr>)}</tbody></table></div>
          {importPreview.length > 20 && <p className="mt-3 text-xs text-slate-500">Menampilkan 20 baris pertama. Semua baris valid tetap akan diimport.</p>}
        </section>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total aset</p><p className="mt-1 text-2xl font-bold text-slate-900">{assets.length}</p><p className="text-xs text-slate-500">bidang terdaftar</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bersertifikat</p><p className="mt-1 text-2xl font-bold text-emerald-600">{certified}</p><p className="text-xs text-slate-500">dokumen lengkap</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total luas</p><p className="mt-1 text-2xl font-bold text-blue-600">{totalArea.toLocaleString("id-ID")} m²</p><p className="text-xs text-slate-500">akumulasi luas tanah</p></div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold text-slate-900">Daftar inventaris</h2><p className="text-sm text-slate-500">Gunakan pencarian untuk menemukan aset dengan cepat.</p></div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{filteredAssets.length} data ditemukan</span>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
                <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, nomor, OPD, lokasi, atau alamat..." className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Semua Status</option><option>Bersertifikat</option><option>Belum Bersertifikat</option><option>Keterangan Lainnya</option>
              </select>
              <select value={district} onChange={(event) => setDistrict(event.target.value)} className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Semua Kecamatan</option>
                {districts.map((item) => <option key={item}>{item}</option>)}
              </select>
              {(search || status !== "Semua Status" || district !== "Semua Kecamatan") && <button type="button" onClick={resetFilters} className="h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">Reset</button>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="w-16 px-5 py-4 font-semibold">No</th>
                  <th className="px-5 py-4 font-semibold">Aset</th>
                  <th className="px-5 py-4 font-semibold">Lokasi</th>
                  <th className="px-5 py-4 font-semibold">OPD</th>
                  <th className="px-5 py-4 text-right font-semibold">Luas</th>
                  <th className="px-5 py-4 font-semibold">Sertifikat</th>
                  <th className="px-5 py-4 font-semibold">Nilai perolehan</th>
                  <th className="px-5 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const assetStatus = getAssetStatus(asset);
                  const statusBadgeClass = assetStatus === "Bersertifikat"
                    ? "bg-emerald-50 text-emerald-700"
                    : assetStatus === "Belum Bersertifikat"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-blue-50 text-blue-700";
                  return (
                    <tr key={asset.id} className="transition hover:bg-blue-50/40">
                      <td className="px-5 py-4 align-top font-medium text-slate-500">{asset.no}</td>
                      <td className="max-w-[280px] px-5 py-4 align-top">
                        <p className="font-semibold text-slate-900">{asset.nama_barang_aset}</p>
                        <p className="mt-1 text-xs text-slate-500">Register: {asset.no_register}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{asset.penggunaan}</p>
                      </td>
                      <td className="max-w-[220px] px-5 py-4 align-top">
                        <p className="font-medium text-slate-700">{asset.lokasi_aset.replace(/^Kecamatan\s+/i, "")}</p>
                        <p className="mt-1 text-xs text-slate-500">{asset.alamat}</p>
                      </td>
                      <td className="max-w-[170px] px-5 py-4 align-top text-slate-600">{asset.dinas_opd}</td>
                      <td className="px-5 py-4 text-right align-top font-medium text-slate-700">{asset.luas_m2 !== null ? `${asset.luas_m2.toLocaleString("id-ID")} m²` : "-"}</td>
                      <td className="px-5 py-4 align-top">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}>{assetStatus}</span>
                        <p className="mt-2 text-xs text-slate-500">{asset.no_sertifikat === "-" ? "Dokumen belum tersedia" : asset.no_sertifikat}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-slate-700">{asset.nilai_perolehan !== null ? `Rp ${asset.nilai_perolehan.toLocaleString("id-ID")}` : "-"}</td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-center gap-2">
                          <Link href={`/aset/${asset.id}`} className="ui-button ui-button-secondary text-xs font-medium">Detail</Link>
                          <Link href={`/aset/${asset.id}/edit`} className="ui-button ui-button-outline text-xs font-medium text-blue-600">Edit</Link>
                          <button type="button" onClick={() => handleDelete(asset)} className="ui-button-danger text-xs font-medium">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && <tr><td colSpan={8} className="px-5 py-14 text-center"><p className="font-medium text-slate-700">Data aset tidak ditemukan</p><p className="mt-1 text-sm text-slate-500">Coba ubah kata kunci atau filter yang digunakan.</p><button type="button" onClick={resetFilters} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">Hapus semua filter</button></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-1 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Menampilkan <strong className="text-slate-700">{filteredAssets.length}</strong> dari <strong className="text-slate-700">{assets.length}</strong> aset</span>
            <span>Geser tabel ke samping untuk melihat kolom lainnya</span>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
