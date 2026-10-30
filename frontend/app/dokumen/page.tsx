
"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import AppLayout from "@/components/layout/AppLayout";
import { dummyAssets } from "@/data/dummy-assets";
import { loadAssets } from "@/lib/asset-storage";
import {
  AssetDocument,
  loadDocuments,
  saveDocuments,
} from "@/lib/document-storage";
import { photoFingerprint, uniquePhotos } from "@/lib/photo-utils";
import { Asset } from "@/types/asset";
import { districts } from "@/components/map/MapFilter";
import { getAssetStatus } from "@/lib/asset-utils";
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
} from "@/lib/auth-storage";

interface DocumentForm {
  assetId: string;
  title: string;
  type: string;
  description: string;
  photos: string[];
}

const emptyForm: DocumentForm = {
  assetId: "",
  title: "",
  type: "Foto Aset",
  description: "",
  photos: [],
};

function readFiles(files: FileList | null): Promise<string[]> {
  if (!files?.length) return Promise.resolve([]);

  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () =>
            reject(new Error(`Foto ${file.name} tidak dapat dibaca.`));

          reader.readAsDataURL(file);
        }),
    ),
  );
}

export default function DokumenPage() {
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [search, setSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AssetStatusFilter>("Semua Status");
  const [acquisitionSourceFilter, setAcquisitionSourceFilter] =
    useState<AcquisitionSourceFilter>("Semua Asal Usul");

  const [modal, setModal] = useState<"form" | "detail" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<AssetDocument | null>(null);
  const [form, setForm] = useState<DocumentForm>(emptyForm);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [formError, setFormError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Memeriksa role saat halaman dibuka dan ketika sesi berubah di tab lain.
 // Memperbarui role saat login atau logout.
useEffect(() => {
  const refreshRole = () => {
    setIsAdmin(loadAuthSession()?.user.role === "admin");
  };

  refreshRole();

  const unsubscribe = subscribeAuthSession(refreshRole);

  return unsubscribe;
}, []);

  // Pemeriksaan ulang role sebelum aksi pengubahan data.
  function requireAdmin(): boolean {
    const session = loadAuthSession();

    if (!session) {
      window.location.href = "/login";
      return false;
    }

    if (session.user.role !== "admin") {
      window.alert("Akses ditolak. Fitur ini hanya untuk admin.");
      setIsAdmin(false);
      return false;
    }

    setIsAdmin(true);
    return true;
  }

  // Memuat data aset dan dokumen dari localStorage.
  useEffect(() => {
    const refresh = () => {
      const nextAssets = loadAssets();
      const assetIds = new Set(nextAssets.map((asset) => asset.id));
      const storedDocuments = loadDocuments();

      const nextDocuments = storedDocuments.filter((document) =>
        assetIds.has(document.assetId),
      );

      if (nextDocuments.length !== storedDocuments.length) {
        saveDocuments(nextDocuments);
      }

      setAssets(nextAssets);
      setDocuments(nextDocuments);
    };

    refresh();

    window.addEventListener("assets-updated", refresh);
    window.addEventListener("documents-updated", refresh);

    return () => {
      window.removeEventListener("assets-updated", refresh);
      window.removeEventListener("documents-updated", refresh);
    };
  }, []);

  const assetById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  );

  const filteredDocuments = documents.filter((document) => {
    const asset = assetById.get(document.assetId);
    const query = search.toLowerCase();

    const searchable = [
      document.title,
      asset?.nama_barang_aset,
      asset?.no,
      asset?.no_register,
      asset?.dinas_opd,
      asset?.lokasi_aset,
      asset?.alamat,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !query || searchable.includes(query);
    const matchesAsset =
      !assetFilter || String(document.assetId) === assetFilter;

    const matchesDistrict =
      !districtFilter ||
      asset?.lokasi_aset
        .toLowerCase()
        .includes(districtFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "Semua Status" ||
      (asset && getAssetStatus(asset) === statusFilter);

    const matchesAcquisition = asset
      ? matchesAcquisitionSource(asset, acquisitionSourceFilter)
      : acquisitionSourceFilter === "Semua Asal Usul";

    return (
      matchesSearch &&
      matchesAsset &&
      matchesDistrict &&
      matchesStatus &&
      matchesAcquisition
    );
  });

  const openUpload = () => {
    if (!requireAdmin()) return;

    setEditingId(null);
    setSelectedDocument(null);
    setForm(emptyForm);
    setFormError("");
    setModal("form");
  };

  const openEdit = (document: AssetDocument) => {
    if (!requireAdmin()) return;

    setEditingId(document.id);
    setSelectedDocument(null);

    setForm({
      assetId: String(document.assetId),
      title: document.title,
      type: document.type,
      description: document.description,
      photos: document.photos,
    });

    setFormError("");
    setModal("form");
  };

  const openDetail = (document: AssetDocument) => {
    setSelectedDocument(document);
    setModal("detail");
  };

  const handleFiles = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (!requireAdmin()) {
      event.target.value = "";
      return;
    }

    setIsReadingFiles(true);
    setFormError("");

    try {
      const photos = await readFiles(event.target.files);

      setForm((current) => ({
        ...current,
        photos: [...current.photos, ...photos],
      }));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Foto tidak dapat dibaca.",
      );
    } finally {
      setIsReadingFiles(false);
      event.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    if (!requireAdmin()) return;

    setForm((current) => ({
      ...current,
      photos: current.photos.filter(
        (_, photoIndex) => photoIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!requireAdmin()) return;

    if (!form.assetId || !form.title.trim()) {
      setFormError(
        "Pilih aset dan isi nama dokumen terlebih dahulu.",
      );
      return;
    }

    if (!form.photos.length) {
      setFormError(
        "Tambahkan minimal satu foto untuk dokumen ini.",
      );
      return;
    }

    let newPhotos: string[];

    try {
      const selectedPhotos = await uniquePhotos(form.photos);

      const otherDocuments = documents.filter(
        (document) => document.id !== editingId,
      );

      const existingPhotoHashes = new Set<string>();

      for (const document of otherDocuments) {
        if (document.assetId !== Number(form.assetId)) continue;

        for (const photo of document.photos) {
          existingPhotoHashes.add(await photoFingerprint(photo));
        }
      }

      newPhotos = [];

      for (const photo of selectedPhotos) {
        const hash = await photoFingerprint(photo);

        if (existingPhotoHashes.has(hash)) continue;

        existingPhotoHashes.add(hash);
        newPhotos.push(photo);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? `Upload dibatalkan! ${error.message}`
          : "Upload dibatalkan! Foto tidak dapat divalidasi.",
      );
      return;
    }

    if (!newPhotos.length) {
      setFormError(
        "Upload dibatalkan! Foto yang dipilih sudah tersimpan untuk aset ini. Tidak ada foto atau dokumen baru yang ditambahkan.",
      );
      return;
    }

    // Validasi ulang setelah proses asynchronous selesai.
    if (!requireAdmin()) return;

    const currentDocuments = loadDocuments();

    const nextDocument: AssetDocument = {
      id: editingId ?? `document-${Date.now()}`,
      assetId: Number(form.assetId),
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      photos: newPhotos,
      createdAt: editingId
        ? currentDocuments.find(
            (document) => document.id === editingId,
          )?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    const nextDocuments = editingId
      ? currentDocuments.map((document) =>
          document.id === editingId ? nextDocument : document,
        )
      : [nextDocument, ...currentDocuments];

    saveDocuments(nextDocuments);
    setDocuments(nextDocuments);
    setModal(null);
  };

  const handleDelete = (document: AssetDocument) => {
    if (!requireAdmin()) return;

    if (
      !window.confirm(
        `Hapus dokumen "${document.title}" beserta semua fotonya?`,
      )
    ) {
      return;
    }

    const currentDocuments = loadDocuments();

    const nextDocuments = currentDocuments.filter(
      (item) => item.id !== document.id,
    );

    saveDocuments(nextDocuments);
    setDocuments(nextDocuments);

    if (selectedDocument?.id === document.id) {
      setModal(null);
      setSelectedDocument(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#315F86]">
      Arsip Digital
    </p>

    <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#193B5A]">
      Dokumen &amp; Foto Aset
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      Kelola foto dan dokumen pendukung setiap aset tanah.
    </p>
  </div>

  {isAdmin && (
    <button
      type="button"
      onClick={openUpload}
      className="ui-button-primary rounded-xl font-medium shadow-sm"
    >
      + Upload Foto
    </button>
  )}
</div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Total Dokumen
        </p>
        <p className="mt-3 text-3xl font-bold text-[#193B5A]">
          {documents.length}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Arsip dokumentasi tersimpan
        </p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7EFF8] text-xl text-[#315F86]">
        <span aria-hidden="true">▤</span>
      </div>
    </div>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Total Foto
        </p>
        <p className="mt-3 text-3xl font-bold text-emerald-700">
          {documents.reduce(
            (total, document) => total + document.photos.length,
            0,
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Foto dari seluruh arsip
        </p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-700">
        <span aria-hidden="true">▧</span>
      </div>
    </div>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 xl:col-span-1">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Aset Terdokumentasi
        </p>
        <p className="mt-3 text-3xl font-bold text-amber-700">
          {
            new Set(
              documents.map((document) => document.assetId),
            ).size
          }
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Aset yang memiliki arsip
        </p>
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-700">
        <span aria-hidden="true">⌂</span>
      </div>
    </div>
  </div>
</div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="asset-filter-bar asset-filter-bar--documents border-b border-slate-200 bg-slate-50/70 p-5">
            <div className="asset-filter-search relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama dokumen atau aset..."
                className="asset-filter-control w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 shadow-sm transition focus:border-[#315F86] focus:outline-none focus:ring-2 focus:ring-[#315F86]/10"
                aria-label="Cari dokumen atau aset"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as AssetStatusFilter,
                )
              }
             className="asset-filter-control rounded-xl border border-slate-200 bg-white shadow-sm transition focus:border-[#315F86] focus:outline-none focus:ring-2 focus:ring-[#315F86]/10"
              aria-label="Filter status sertifikat"
            >
              <option>Semua Status</option>
              {assetStatusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <select
              value={districtFilter}
              onChange={(event) =>
                setDistrictFilter(event.target.value)
              }
              className="asset-filter-control"
              aria-label="Filter kecamatan"
            >
              <option value="">Semua Kecamatan</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              value={acquisitionSourceFilter}
              onChange={(event) =>
                setAcquisitionSourceFilter(
                  event.target.value as AcquisitionSourceFilter,
                )
              }
              className="asset-filter-control"
              aria-label="Filter asal usul"
            >
              <option>Semua Asal Usul</option>
              {acquisitionSourceOptions.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>

            <select
              value={assetFilter}
              onChange={(event) =>
                setAssetFilter(event.target.value)
              }
              className="asset-filter-control"
              aria-label="Filter aset"
            >
              <option value="">Semua Aset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.nama_barang_aset}
                </option>
              ))}
            </select>
          </div>

          {filteredDocuments.length ? (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDocuments.map((document) => {
                const asset = assetById.get(document.assetId);

                return (
                  <article
  key={document.id}
  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
>
  <button
    type="button"
    onClick={() => openDetail(document)}
    className="relative block h-52 w-full overflow-hidden bg-slate-100 text-left"
    aria-label={`Lihat foto ${document.title}`}
  >
    <img
      src={document.photos[0]}
      alt={document.title}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
    />

    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#193B5A] shadow-sm">
      {document.type}
    </span>

    <span className="absolute bottom-3 right-3 rounded-lg bg-[#193B5A]/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
      {document.photos.length} foto
    </span>
  </button>

  <div className="p-5">
    <h2 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-[#193B5A]">
      {document.title}
    </h2>

    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
      <div className="flex items-start gap-2 text-sm">
        <span className="mt-0.5 text-[#315F86]" aria-hidden="true">
          ▤
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Dinas / OPD</p>
          <p className="break-words font-medium text-slate-700">
            {asset?.dinas_opd ?? "-"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm">
        <span className="mt-0.5 text-[#315F86]" aria-hidden="true">
          ⌂
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">Penggunaan aset</p>
          <p className="break-words font-medium text-slate-700">
            {asset?.penggunaan ?? "-"}
          </p>
        </div>
      </div>
    </div>

   
<div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
  {/* Kiri: Edit dan Hapus */}
  <div className="flex items-center gap-2">
    {isAdmin && (
      <>
        <button
          type="button"
          onClick={() => openEdit(document)}
          aria-label={`Edit ${document.title}`}
          title="Edit dokumen"
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
        </button>

        <button
          type="button"
          onClick={() => handleDelete(document)}
          aria-label={`Hapus ${document.title}`}
          title="Hapus dokumen"
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

  {/* Kanan: tombol utama */}
  <button
    type="button"
    onClick={() => openDetail(document)}
    className="inline-flex items-center justify-center rounded-xl bg-[#244B70] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#193B5A] hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
  >
    Lihat Dokumen
  </button>
</div>

  </div>
</article>
                );
              })}
            </div>
          ) : (
           <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7EFF8] text-3xl text-[#315F86]">
    <span aria-hidden="true">▤</span>
  </div>

  <h2 className="mt-5 text-lg font-bold text-[#193B5A]">
    {search ||
    assetFilter ||
    districtFilter ||
    statusFilter !== "Semua Status" ||
    acquisitionSourceFilter !== "Semua Asal Usul"
      ? "Dokumen tidak ditemukan"
      : "Belum ada dokumen aset"}
  </h2>

  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
    {search ||
    assetFilter ||
    districtFilter ||
    statusFilter !== "Semua Status" ||
    acquisitionSourceFilter !== "Semua Asal Usul"
      ? "Coba ubah kata kunci atau filter untuk menemukan dokumen yang sesuai."
      : isAdmin
        ? "Klik tombol Upload Foto untuk menambahkan dokumentasi aset tanah."
        : "Dokumen dan foto aset belum tersedia."}
  </p>

  {isAdmin &&
    !search &&
    !assetFilter &&
    !districtFilter &&
    statusFilter === "Semua Status" &&
    acquisitionSourceFilter === "Semua Asal Usul" && (
      <button
        type="button"
        onClick={openUpload}
        className="ui-button-primary mt-5 rounded-xl font-medium"
      >
        + Upload Foto
      </button>
    )}
</div>
          )}
        </div>
      </div>

      {modal === "form" && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#193B5A]">
                  {editingId ? "Edit Dokumen Foto" : "Upload Foto Aset"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Anda dapat memilih beberapa foto dalam satu dokumen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModal(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Aset
                <select
                  required
                  value={form.assetId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      assetId: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                >
                  <option value="">Pilih aset</option>

                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.nama_barang_aset} — {asset.alamat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Jenis dokumen
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                >
                  <option>Foto Aset</option>
                  <option>Sertifikat</option>
                  <option>Dokumen Pendukung</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Nama dokumen
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Contoh: Foto Tanah Kantor Camat"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Keterangan
              <span className="font-normal text-slate-400">
                {" "}
                (opsional)
              </span>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
              />
            </label>

           <label className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-[#B8CDE0] bg-[#F4F8FC] p-6 text-center text-sm text-[#315F86] transition hover:border-[#315F86] hover:bg-[#E7EFF8]">
              <span className="font-semibold">
                {isReadingFiles ? "Membaca foto..." : "Pilih foto"}
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                JPG, PNG, atau WEBP · bisa pilih lebih dari satu
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="sr-only"
              />
            </label>

            {form.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {form.photos.map((photo, index) => (
                  <div
                    key={`${photo.slice(0, 20)}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 px-1.5 text-sm text-white"
                        aria-label={`Hapus foto ${index + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="ui-button-secondary font-medium"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isReadingFiles}
                className="ui-button-primary font-medium"
              >
                {editingId ? "Simpan perubahan" : "Simpan dokumen"}
              </button>
            </div>
          </form>
        </div>
      )}

      {modal === "detail" && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#193B5A]">
                  {selectedDocument.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    assetById.get(selectedDocument.assetId)
                      ?.nama_barang_aset
                  }{" "}
                  · {selectedDocument.type}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModal(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {selectedDocument.description && (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {selectedDocument.description}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedDocument.photos.map((photo, index) => (
                <figure
                  key={`${photo.slice(0, 20)}-${index}`}
                 className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={photo}
                    alt={`${selectedDocument.title} ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />

                  <figcaption className="px-3 py-2 text-xs text-slate-500">
                    Foto {index + 1} dari{" "}
                    {selectedDocument.photos.length}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Link
                href={`/aset/${selectedDocument.assetId}`}
                className="ui-button ui-button-outline font-medium text-blue-700"
              >
                Lihat data aset
              </Link>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openEdit(selectedDocument)}
                  className="ui-button-primary font-medium"
                >
                  Edit dokumen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
