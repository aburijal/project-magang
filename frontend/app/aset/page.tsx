
"use client";

import { ChangeEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { dummyAssets } from "@/data/dummy-assets";
import {
  deleteAssetWithDocuments,
  loadAssets,
  saveAssets,
} from "@/lib/asset-storage";
import {
  AssetDocument,
  loadDocuments,
  saveDocuments,
} from "@/lib/document-storage";
import { getAssetStatus } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";
import {
  AssetImportPreview,
  findDuplicateAsset,
  previewAssetImport,
} from "@/lib/asset-import";
import { uniquePhotos, photoFingerprint } from "@/lib/photo-utils";
import {
  acquisitionSourceOptions,
  assetStatusOptions,
  AssetStatusFilter,
  AcquisitionSourceFilter,
  matchesAcquisitionSource,
} from "@/lib/asset-filters";
import {
  loadAuthSession,
  subscribeAuthSession,
  AuthSession,
} from "@/lib/auth-storage";

function getStatusFromQuery(value: string | null): AssetStatusFilter {
  const normalized = value?.trim().toLowerCase().replaceAll("_", " ");
  const match = assetStatusOptions.find(
    (option) => option.toLowerCase() === normalized,
  );

  return match ?? "Semua Status";
}

function AsetContent({
  initialStatus,
}: {
  initialStatus: AssetStatusFilter;
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<AssetStatusFilter>(initialStatus);
  const [district, setDistrict] = useState("Semua Kecamatan");
  const [acquisitionSource, setAcquisitionSource] =
    useState<AcquisitionSourceFilter>("Semua Asal Usul");
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);
  const [importPreview, setImportPreview] =
    useState<AssetImportPreview[] | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isReadingImport, setIsReadingImport] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  // Memuat sesi login dan memperbaruinya saat storage berubah.
  // Memuat sesi login dan memperbaruinya saat login/logout.
  useEffect(() => {
    const refreshSession = () => {
      setSession(loadAuthSession());
    };

    refreshSession();

    const unsubscribe = subscribeAuthSession(refreshSession);

    return unsubscribe;
  }, []);
  const isAdmin = session?.user.role === "admin";

  // Pemeriksaan akses sebelum aksi yang mengubah data.
  function requireAdmin(): boolean {
    const currentSession = loadAuthSession();

    if (!currentSession) {
      router.push("/login");
      return false;
    }

    if (currentSession.user.role !== "admin") {
      window.alert(
        "Akses ditolak. Hanya admin yang boleh mengubah data.",
      );
      return false;
    }

    return true;
  }

  // Memuat data aset dari penyimpanan lokal.
  useEffect(() => {
    const refreshAssets = () => {
      setAssets(loadAssets());
    };

    refreshAssets();

    window.addEventListener("assets-updated", refreshAssets);

    return () => {
      window.removeEventListener("assets-updated", refreshAssets);
    };
  }, []);

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const keyword = search.trim().toLowerCase();

        const searchable = [
          asset.nama_barang_aset,
          asset.no,
          asset.no_register,
          asset.dinas_opd,
          asset.lokasi_aset,
          asset.alamat,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(keyword) &&
          (status === "Semua Status" ||
            getAssetStatus(asset) === status) &&
          (district === "Semua Kecamatan" ||
            asset.lokasi_aset === district) &&
          matchesAcquisitionSource(asset, acquisitionSource)
        );
      }),
    [assets, search, status, district, acquisitionSource],
  );

  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          assets
            .map((asset) => asset.lokasi_aset)
            .filter(Boolean),
        ),
      ).sort(),
    [assets],
  );

  function resetFilters() {
    setSearch("");
    setStatus("Semua Status");
    setDistrict("Semua Kecamatan");
    setAcquisitionSource("Semua Asal Usul");
  }

  function handleDelete(asset: Asset) {
    if (!requireAdmin()) return;

    const confirmed = window.confirm(
      `Hapus aset "${asset.nama_barang_aset}" dari katalog?`,
    );

    if (!confirmed) return;

    setDeleteError("");

    try {
      deleteAssetWithDocuments(asset.id);
      setAssets(loadAssets());
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Aset dan dokumen terkait tidak dapat dihapus.",
      );
    }
  }

  async function handleImportFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    if (!requireAdmin()) {
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsReadingImport(true);

    try {
      setImportPreview(await previewAssetImport(file, loadAssets()));
    } catch (error) {
      setImportPreview([
        {
          rowNumber: 0,
          asset: null,
          error:
            error instanceof Error
              ? error.message
              : "File Excel tidak dapat dibaca.",
          photos: [],
        },
      ]);
    } finally {
      setIsReadingImport(false);
    }
  }

  async function confirmImport() {
    if (!requireAdmin()) return;
    if (!importPreview) return;

    // Tolak seluruh proses jika preview memiliki data tidak valid.
    const validationErrors = importPreview.filter(
      (item) => item.error || !item.asset,
    );

    if (validationErrors.length) return;

    const currentAssets = loadAssets();

    // Tolak seluruh import jika terdapat aset duplikat.
    const duplicate = importPreview
      .map((item) => item.asset)
      .filter((asset): asset is Asset => Boolean(asset))
      .find((asset) => findDuplicateAsset(asset, currentAssets));

    if (duplicate) {
      setImportPreview((current) =>
        current?.map((item, index) =>
          index === 0
            ? {
              ...item,
              error:
                "Data aset sudah pernah diimpor. Seluruh proses import dibatalkan.",
            }
            : item,
        ) ?? null,
      );
      return;
    }

    try {
      const validAssets = importPreview.map(
        (item) => item.asset as Asset,
      );

      const currentDocuments = loadDocuments();
      const importedDocuments: AssetDocument[] = [];
      const existingPhotoHashes = new Map<number, Set<string>>();

      for (const document of currentDocuments) {
        const hashes =
          existingPhotoHashes.get(document.assetId) ?? new Set<string>();

        for (const photo of document.photos) {
          hashes.add(await photoFingerprint(photo));
        }

        existingPhotoHashes.set(document.assetId, hashes);
      }

      for (const item of importPreview) {
        if (!item.asset || !item.photos.length) continue;

        const photos = await uniquePhotos(item.photos);
        const hashes =
          existingPhotoHashes.get(item.asset.id) ?? new Set<string>();
        const newPhotos: string[] = [];

        for (const photo of photos) {
          const hash = await photoFingerprint(photo);

          if (hashes.has(hash)) continue;

          hashes.add(hash);
          newPhotos.push(photo);
        }

        if (newPhotos.length) {
          importedDocuments.push({
            id: `import-${item.asset.id}-${Date.now()}-${importedDocuments.length}`,
            assetId: item.asset.id,
            title: `Dokumen foto - ${item.asset.nama_barang_aset}`,
            type: "Foto Aset",
            description: "Foto diimpor dari file Excel.",
            photos: newPhotos,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Simpan nilai sebelumnya agar bisa dipulihkan jika penyimpanan gagal.
      const previousAssets = window.localStorage.getItem(
        "lhokseumawe-assets",
      );
      const previousDocuments = window.localStorage.getItem(
        "lhokseumawe-asset-documents",
      );

      try {
        saveAssets([...currentAssets, ...validAssets]);
        saveDocuments([...importedDocuments, ...currentDocuments]);
      } catch (error) {
        if (previousAssets === null) {
          window.localStorage.removeItem("lhokseumawe-assets");
        } else {
          window.localStorage.setItem(
            "lhokseumawe-assets",
            previousAssets,
          );
        }

        if (previousDocuments === null) {
          window.localStorage.removeItem(
            "lhokseumawe-asset-documents",
          );
        } else {
          window.localStorage.setItem(
            "lhokseumawe-asset-documents",
            previousDocuments,
          );
        }

        throw error;
      }

      setAssets(loadAssets());
      setImportPreview(null);
    } catch (error) {
      setImportPreview((current) =>
        current?.map((item, index) =>
          index === 0
            ? {
              ...item,
              error:
                error instanceof Error
                  ? error.message
                  : "Data tidak dapat disimpan.",
            }
            : item,
        ) ?? null,
      );
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#315F86]">
              Katalog inventaris
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#193B5A]">
              Data Aset Tanah
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola dan pantau seluruh aset tanah pemerintah daerah.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {isAdmin && (
              <>
                <label className="ui-button ui-button-outline cursor-pointer rounded-xl border border-[#B8CDE0] bg-[#F4F8FC] font-semibold text-[#315F86] shadow-sm transition hover:bg-[#E7EFF8]"
                  htmlFor="import-file"
                >
                  {isReadingImport
                    ? "Membaca Excel..."
                    : "Import File Excel"}
                  <input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportFile}
                    disabled={isReadingImport}
                    className="hidden"
                  />
                </label>

                <Link
                  href="/aset/tambah"
                  className="ui-button ui-button-primary rounded-xl font-semibold shadow-sm transition"
                >
                  + Tambah Aset
                </Link>
              </>
            )}
          </div>
        </div>

        {deleteError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </p>
        )}

        <Link
          href="/aset"
          className="total-asset-card rounded-2xl border border-[#D7E4F0] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          aria-label={`Total aset: ${assets.length} bidang tanah terdaftar`}
        >
          <span className="total-asset-card__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M4 19.5h16M5.5 19.5V9.75L12 5l6.5 4.75v9.75M8.5 19.5v-5h7v5M8 10.25h.01M12 10.25h.01M16 10.25h.01"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="min-w-0">
            <span className="total-asset-card__label">TOTAL ASET</span>
            <strong className="total-asset-card__value">
              {assets.length.toLocaleString("id-ID")}
            </strong>
            <span className="total-asset-card__description">
              Bidang tanah terdaftar
            </span>
          </span>
        </Link>

        {isAdmin && importPreview && (
          <section className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Preview Import Excel
                </h2>
                <p className="text-sm text-slate-500">
                  {importPreview.filter((item) => !item.error).length} baris
                  baru, {importPreview.filter((item) => item.error).length}{" "}
                  data identik atau ditolak.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportPreview(null)}
                  className="ui-button-secondary font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmImport}
                  className="ui-button-primary font-medium"
                >
                  Tambahkan Data Valid
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Baris</th>
                    <th className="px-3 py-2">Nama aset</th>
                    <th className="px-3 py-2">Register</th>
                    <th className="px-3 py-2">Alamat</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreview.slice(0, 20).map((item) => (
                    <tr key={item.rowNumber}>
                      <td className="px-3 py-2 text-slate-500">
                        {item.rowNumber || "-"}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {item.asset?.nama_barang_aset || "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {item.asset?.no_register || "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {item.asset?.alamat || "-"}
                      </td>
                      <td
                        className={`px-3 py-2 text-xs font-medium ${item.error
                            ? "text-red-600"
                            : item.warning
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                      >
                        {item.error || item.warning || "Siap diimport"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importPreview.length > 20 && (
              <p className="mt-3 text-xs text-slate-500">
                Menampilkan 20 baris pertama. Semua baris valid tetap akan
                diimport.
              </p>
            )}
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#193B5A]">
                  Daftar inventaris
                </h2>
                <p className="text-sm text-slate-500">
                  Gunakan pencarian untuk menemukan aset dengan cepat.
                </p>
              </div>
              <span className="rounded-full border border-[#D7E4F0] bg-[#F4F8FC] px-3 py-1.5 text-xs font-semibold text-[#315F86]">
                {filteredAssets.length} data ditemukan
              </span>
            </div>

            <div className="asset-filter-bar asset-filter-bar--assets rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="asset-filter-search relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ⌕
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama, nomor, OPD, lokasi, atau alamat..."
                  className="asset-filter-control w-full pl-8 pr-3"
                  aria-label="Cari aset"
                />
              </div>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(getStatusFromQuery(event.target.value))
                }
                className="asset-filter-control"
                aria-label="Filter status sertifikat"
              >
                <option>Semua Status</option>
                {assetStatusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>

              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className="asset-filter-control"
                aria-label="Filter kecamatan"
              >
                <option>Semua Kecamatan</option>
                {districts.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={acquisitionSource}
                onChange={(event) =>
                  setAcquisitionSource(
                    event.target.value as AcquisitionSourceFilter,
                  )
                }
                className="asset-filter-control"
                aria-label="Filter asal usul"
              >
                <option>Semua Asal Usul</option>
                {acquisitionSourceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="asset-filter-control rounded-lg border-slate-300 bg-white px-4 font-medium text-[#315F86] transition hover:bg-[#E7EFF8]"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#F4F8FC] text-xs uppercase tracking-wide text-[#315F86]">
                <tr className="border-b border-[#D7E4F0]">
                  <th className="w-16 px-5 py-4 font-semibold">No</th>
                  <th className="px-5 py-4 font-semibold">Aset</th>
                  <th className="px-5 py-4 font-semibold">Lokasi</th>
                  <th className="px-5 py-4 font-semibold">OPD</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Luas
                  </th>
                  <th className="px-5 py-4 font-semibold">Sertifikat</th>
                  <th className="px-5 py-4 font-semibold">
                    Nilai perolehan
                  </th>
                  <th className="px-5 py-4 text-center font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const assetStatus = getAssetStatus(asset);

                  const statusBadgeClass =
                    assetStatus === "Bersertifikat"
                      ? "bg-emerald-50 text-emerald-700"
                      : assetStatus === "Belum Bersertifikat"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-blue-50 text-blue-700";

                  return (
                    <tr
                      key={asset.id}
                      className="transition-colors duration-150 hover:bg-[#F4F8FC]"
                    >
                      <td className="px-5 py-4 align-top font-medium text-slate-500">
                        {asset.no}
                      </td>

                      <td className="max-w-[280px] px-5 py-4 align-top">
                        <p className="font-semibold text-slate-900">
                          {asset.nama_barang_aset}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Register: {asset.no_register}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {asset.penggunaan}
                        </p>
                      </td>

                      <td className="max-w-[220px] px-5 py-4 align-top">
                        <p className="font-medium text-slate-700">
                          {asset.lokasi_aset.replace(
                            /^Kecamatan\s+/i,
                            "",
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {asset.alamat}
                        </p>
                      </td>

                      <td className="max-w-[170px] px-5 py-4 align-top text-slate-600">
                        {asset.dinas_opd}
                      </td>

                      <td className="px-5 py-4 text-right align-top font-medium text-slate-700">
                        {asset.luas_m2 !== null
                          ? `${asset.luas_m2.toLocaleString("id-ID")} m²`
                          : "-"}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass}`}
                        >
                          {assetStatus}
                        </span>
                        <p className="mt-2 text-xs text-slate-500">
                          {asset.no_sertifikat === "-"
                            ? "Dokumen belum tersedia"
                            : asset.no_sertifikat}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 align-top text-slate-700">
                        {asset.nilai_perolehan !== null
                          ? `Rp ${asset.nilai_perolehan.toLocaleString("id-ID")}`
                          : "-"}
                      </td>


                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-between gap-3">
                          {/* Kiri: Edit dan Hapus */}
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <>
                                <Link
                                  href={`/aset/${asset.id}/edit`}
                                  aria-label={`Edit ${asset.nama_barang_aset}`}
                                  title="Edit aset"
                                  className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md active:translate-y-0 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5 transition-transform duration-200 group-hover:rotate-[-5deg]"
                                    aria-hidden="true"
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                                  </svg>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(asset)}
                                  aria-label={`Hapus ${asset.nama_barang_aset}`}
                                  title="Hapus aset"
                                  className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md active:translate-y-0 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                                    aria-hidden="true"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="m19 6-1 14H6L5 6" />
                                    <path d="M10 11v5M14 11v5" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Kanan: Lihat Detail */}
                          <Link
                            href={`/aset/${asset.id}`}
                            className="inline-flex items-center justify-center rounded-xl bg-[#244B70] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#193B5A] hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
                          >
                            Lihat Detail
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <p className="font-semibold text-[#193B5A]">
                        Data aset tidak ditemukan
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Coba ubah kata kunci atau filter yang digunakan.
                      </p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-[#315F86] transition hover:bg-[#E7EFF8]"
                      >
                        Hapus semua filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-700">
                {filteredAssets.length}
              </strong>{" "}
              dari{" "}
              <strong className="text-slate-700">{assets.length}</strong>{" "}
              aset
            </span>
            <span>Geser tabel ke samping untuk melihat kolom lainnya</span>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function AsetPageContent() {
  const searchParams = useSearchParams();
  const queryStatus = searchParams.get("status");
  const initialStatus = getStatusFromQuery(queryStatus);

  return (
    <AsetContent
      key={`${queryStatus ?? ""}:${initialStatus}`}
      initialStatus={initialStatus}
    />
  );
}

export default function AsetPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-slate-500">
          Memuat data aset...
        </div>
      }
    >
      <AsetPageContent />
    </Suspense>
  );
}
