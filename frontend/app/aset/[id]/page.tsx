"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getAsset } from "@/lib/asset-storage";
import { loadDocuments } from "@/lib/document-storage";
import { exportAssetToPdf } from "@/lib/asset-export";
import { loadAuthSession, subscribeAuthSession } from "@/lib/auth-storage";
import { getAssetStatus } from "@/lib/asset-utils";

export default function DetailAsetPage() {
  const params = useParams<{ id: string }>();
  const [isAdmin, setIsAdmin] = useState(false);

  const assetId = Number(params.id);
  const asset = useMemo(() => getAsset(assetId), [assetId]);
  const document = useMemo(
    () => loadDocuments().find((item) => item.assetId === assetId),
    [assetId],
  );

  useEffect(() => {
    const refreshRole = () => {
      setIsAdmin(loadAuthSession()?.user.role === "admin");
    };

    refreshRole();
    return subscribeAuthSession(refreshRole);
  }, []);

  if (!asset) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500">
            !
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Aset tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Data mungkin sudah dihapus atau alamat halaman tidak valid.
          </p>
          <Link
            href="/aset"
            className="ui-button ui-button-primary mt-5 inline-flex"
          >
            Kembali ke Data Aset
          </Link>
        </div>
      </AppLayout>
    );
  }

  const status = getAssetStatus(asset);
  const isCertified = status === "Bersertifikat";
  const statusClass = isCertified
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : status === "Belum Bersertifikat"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-blue-200 bg-blue-50 text-blue-800";

  const details = [
    ["Nomor register", asset.no_register],
    ["Dinas / OPD", asset.dinas_opd],
    ["Lokasi", asset.lokasi_aset],
    ["Alamat / Gampong", asset.alamat],
    [
      "Luas tanah",
      asset.luas_m2 !== null
        ? `${asset.luas_m2.toLocaleString("id-ID")} m²`
        : "-",
    ],
    ["Tanggal perolehan", asset.tanggal_perolehan],
    ["Status hak", asset.hak],
    ["Nomor sertifikat", asset.no_sertifikat],
    ["Penggunaan", asset.penggunaan],
    ["Asal usul", asset.asal_usul],
    [
      "Nilai perolehan",
      asset.nilai_perolehan !== null
        ? `Rp ${asset.nilai_perolehan.toLocaleString("id-ID")}`
        : "-",
    ],
    ["Keterangan", asset.keterangan],
  ];

  
  function handleExportPdf() {
    const session = loadAuthSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    if (session.user.role !== "admin") {
      window.alert("Akses ditolak. Ekspor PDF hanya untuk admin.");
      return;
    }

    const currentAsset = getAsset(assetId);

    if (!currentAsset) {
      window.alert("Data aset tidak ditemukan.");
      return;
    }

    const currentDocument = loadDocuments().find(
      (item) => item.assetId === assetId,
    );

    exportAssetToPdf(currentAsset, currentDocument);
  }


  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/aset"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#315F86] transition hover:text-[#193B5A]"
            >
              <span aria-hidden="true">←</span> Kembali ke Data Aset
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#66809A]">
              Detail inventaris
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold leading-tight text-[#193B5A] sm:text-3xl">
              {asset.nama_barang_aset}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Nomor register: {asset.no_register || "-"}
            </p>
          </div>

          {isAdmin && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
className="ui-button ui-button-outline rounded-xl font-semibold text-[#315F86] transition hover:bg-[#F4F8FC]"
              >
                Ekspor PDF
              </button>
              <Link
                href={`/aset/${asset.id}/edit`}
               className="ui-button ui-button-primary rounded-xl font-semibold transition"
              >
                Edit Aset
              </Link>
            </div>
          )}
        </div>

<section className="overflow-hidden rounded-2xl border border-[#D7E4F0] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-[#193B5A] to-[#315F86] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-100">
                Status legalitas tanah
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Informasi Sertifikat
              </h2>
              <p className="mt-1 text-sm text-blue-100">
                Ringkasan status dokumen kepemilikan aset.
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass}`}
            >
              <span className="mr-2 h-2 w-2 rounded-full bg-current" />
              {status}
            </span>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {details.map(([label, value], index) => (
              <div
                key={label}
                className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#B8CDE0] hover:bg-[#F8FAFD] ${
  index === details.length - 1 ? "sm:col-span-2 lg:col-span-3" : ""
}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-2 break-words text-sm font-medium leading-relaxed text-slate-800">
                  {value || "-"}
                </p>
              </div>
            ))}
          </div>

          {(asset.koordinat_x !== null && asset.koordinat_y !== null) && (
            <div className="border-t border-slate-200 bg-slate-50 p-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Lokasi geografis
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Latitude: {asset.koordinat_x} · Longitude: {asset.koordinat_y}
                  </p>
                </div>
                <Link
                  href={`/peta?asset=${asset.id}`}
                 className="ui-button ui-button-outline inline-flex w-fit items-center rounded-xl font-semibold text-[#315F86] transition hover:bg-[#E7EFF8]"
                >
                  Lihat lokasi di peta →
                </Link>
              </div>
            </div>
          )}
        </section>

       <section className="rounded-2xl border border-[#D7E4F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D7E4F0] bg-[#F4F8FC] text-lg text-[#315F86]">
              <span aria-hidden="true">▤</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-[#193B5A]">
                Dokumen dan foto aset
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {document
                  ? `${document.photos.length} foto tersimpan pada dokumen aset ini.`
                  : "Belum ada dokumen yang terhubung dengan aset ini."}
              </p>
              {document && (
                <p className="mt-2 break-words text-sm text-slate-700">
                  {document.title}
                </p>
              )}
              <Link
                href="/dokumen"
                className="mt-3 inline-flex items-center rounded-lg py-1 text-sm font-semibold text-[#315F86] transition hover:text-[#193B5A] hover:underline"
              >
                Buka menu Dokumen Aset →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
