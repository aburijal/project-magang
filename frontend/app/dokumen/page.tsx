"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { dummyAssets } from "@/data/dummy-assets";
import { loadAssets } from "@/lib/asset-storage";
import {
  AssetDocument,
  loadDocuments,
  saveDocuments,
} from "@/lib/document-storage";
import { Asset } from "@/types/asset";

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

  return Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Foto ${file.name} tidak dapat dibaca.`));
    reader.readAsDataURL(file);
  })));
}

export default function DokumenPage() {
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [search, setSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modal, setModal] = useState<"form" | "detail" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<AssetDocument | null>(null);
  const [form, setForm] = useState<DocumentForm>(emptyForm);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setAssets(loadAssets());
      setDocuments(loadDocuments());
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
    const matchesSearch = !query
      || document.title.toLowerCase().includes(query)
      || asset?.nama_barang_aset.toLowerCase().includes(query);
    const matchesAsset = !assetFilter || String(document.assetId) === assetFilter;
    const matchesType = !typeFilter || document.type === typeFilter;
    return matchesSearch && matchesAsset && matchesType;
  });

  const openUpload = () => {
    setEditingId(null);
    setSelectedDocument(null);
    setForm(emptyForm);
    setFormError("");
    setModal("form");
  };

  const openEdit = (document: AssetDocument) => {
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

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsReadingFiles(true);
    setFormError("");
    try {
      const photos = await readFiles(event.target.files);
      setForm((current) => ({ ...current, photos: [...current.photos, ...photos] }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Foto tidak dapat dibaca.");
    } finally {
      setIsReadingFiles(false);
      event.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.assetId || !form.title.trim()) {
      setFormError("Pilih aset dan isi nama dokumen terlebih dahulu.");
      return;
    }
    if (!form.photos.length) {
      setFormError("Tambahkan minimal satu foto untuk dokumen ini.");
      return;
    }

    const nextDocument: AssetDocument = {
      id: editingId ?? `document-${Date.now()}`,
      assetId: Number(form.assetId),
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim(),
      photos: form.photos,
      createdAt: editingId
        ? documents.find((document) => document.id === editingId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };
    const nextDocuments = editingId
      ? documents.map((document) => document.id === editingId ? nextDocument : document)
      : [nextDocument, ...documents];
    saveDocuments(nextDocuments);
    setDocuments(nextDocuments);
    setModal(null);
  };

  const handleDelete = (document: AssetDocument) => {
    if (!window.confirm(`Hapus dokumen "${document.title}" beserta semua fotonya?`)) return;
    const nextDocuments = documents.filter((item) => item.id !== document.id);
    saveDocuments(nextDocuments);
    setDocuments(nextDocuments);
    if (selectedDocument?.id === document.id) setModal(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">ARSIP DIGITAL</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Dokumen &amp; Foto Aset</h1>
            <p className="mt-1 text-sm text-slate-500">Upload dan kelola beberapa foto pendukung setiap aset.</p>
          </div>
          <button type="button" onClick={openUpload} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            + Upload Foto
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total dokumen</p><p className="mt-2 text-2xl font-bold text-slate-900">{documents.length}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total foto</p><p className="mt-2 text-2xl font-bold text-blue-600">{documents.reduce((total, document) => total + document.photos.length, 0)}</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Aset terdokumentasi</p><p className="mt-2 text-2xl font-bold text-emerald-600">{new Set(documents.map((document) => document.assetId)).size}</p></div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama dokumen atau aset..." className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <select value={assetFilter} onChange={(event) => setAssetFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="">Semua Aset</option>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.nama_barang_aset}</option>)}
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
              <option value="">Semua Jenis</option>
              {Array.from(new Set(documents.map((document) => document.type))).map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          {filteredDocuments.length ? (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDocuments.map((document) => {
                const asset = assetById.get(document.assetId);
                return (
                  <article key={document.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <button type="button" onClick={() => openDetail(document)} className="group relative block h-44 w-full bg-slate-100 text-left">
                      <img src={document.photos[0]} alt={document.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                      <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/75 px-2.5 py-1 text-xs font-medium text-white">{document.photos.length} foto</span>
                    </button>
                    <div className="p-4">
                      <h2 className="font-semibold text-slate-900">{document.title}</h2>
                      <p className="mt-1 text-xs text-slate-500">Aset: AT-{asset?.no_register ?? "-"} — {asset?.nama_barang_aset ?? "Aset tidak ditemukan"}</p>
                      <p className="mt-2 text-xs text-slate-500">{document.type}{document.description ? ` · ${document.description}` : ""}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                        <button type="button" onClick={() => openDetail(document)} className="rounded bg-blue-50 px-2.5 py-1.5 text-blue-700 hover:bg-blue-100">Lihat detail</button>
                        <button type="button" onClick={() => openEdit(document)} className="rounded bg-slate-100 px-2.5 py-1.5 text-slate-700 hover:bg-slate-200">Edit</button>
                        <button type="button" onClick={() => handleDelete(document)} className="rounded bg-red-50 px-2.5 py-1.5 text-red-600 hover:bg-red-100">Hapus</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="font-medium text-slate-700">Belum ada foto aset.</p>
              <p className="mt-1 text-sm text-slate-500">Klik “Upload Foto” untuk menambahkan satu atau beberapa foto sekaligus.</p>
            </div>
          )}
        </div>
      </div>

      {modal === "form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-bold text-slate-900">{editingId ? "Edit Dokumen Foto" : "Upload Foto Aset"}</h2><p className="mt-1 text-sm text-slate-500">Anda dapat memilih beberapa foto dalam satu dokumen.</p></div>
              <button type="button" onClick={() => setModal(null)} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Tutup">×</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Aset<select required value={form.assetId} onChange={(event) => setForm({ ...form, assetId: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"><option value="">Pilih aset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.nama_barang_aset} — {asset.alamat}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700">Jenis dokumen<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"><option>Foto Aset</option><option>Sertifikat</option><option>Dokumen Pendukung</option></select></label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">Nama dokumen<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Foto Tanah Kantor Camat" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
            <label className="mt-4 block text-sm font-medium text-slate-700">Keterangan<span className="font-normal text-slate-400"> (opsional)</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500" /></label>
            <label className="mt-4 block cursor-pointer rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center text-sm text-blue-700 hover:bg-blue-50">
              <span className="font-semibold">{isReadingFiles ? "Membaca foto..." : "Pilih foto"}</span><span className="mt-1 block text-xs text-slate-500">JPG, PNG, atau WEBP · bisa pilih lebih dari satu</span>
              <input type="file" accept="image/*" multiple onChange={handleFiles} className="sr-only" />
            </label>
            {form.photos.length > 0 && <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">{form.photos.map((photo, index) => <div key={`${photo.slice(0, 20)}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"><img src={photo} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removePhoto(index)} className="absolute right-1 top-1 hidden rounded-full bg-red-600 px-1.5 text-sm text-white group-hover:block" aria-label={`Hapus foto ${index + 1}`}>×</button></div>)}</div>}
            {formError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button><button type="submit" disabled={isReadingFiles} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">{editingId ? "Simpan perubahan" : "Simpan dokumen"}</button></div>
          </form>
        </div>
      )}

      {modal === "detail" && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{selectedDocument.title}</h2><p className="mt-1 text-sm text-slate-500">{assetById.get(selectedDocument.assetId)?.nama_barang_aset} · {selectedDocument.type}</p></div><button type="button" onClick={() => setModal(null)} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Tutup">×</button></div>
            {selectedDocument.description && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{selectedDocument.description}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{selectedDocument.photos.map((photo, index) => <figure key={`${photo.slice(0, 20)}-${index}`} className="overflow-hidden rounded-lg border border-slate-200"><img src={photo} alt={`${selectedDocument.title} ${index + 1}`} className="aspect-[4/3] w-full object-cover" /><figcaption className="px-3 py-2 text-xs text-slate-500">Foto {index + 1} dari {selectedDocument.photos.length}</figcaption></figure>)}</div>
            <div className="mt-6 flex justify-end gap-3"><Link href={`/aset/${selectedDocument.assetId}`} className="rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50">Lihat data aset</Link><button type="button" onClick={() => openEdit(selectedDocument)} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Edit dokumen</button></div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
