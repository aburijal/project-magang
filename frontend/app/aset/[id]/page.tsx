
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getAsset } from "@/lib/asset-storage";
import { loadDocuments } from "@/lib/document-storage";
import { exportAssetToPdf } from "@/lib/asset-export";
import { loadAuthSession } from "@/lib/auth-storage";

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
    window.addEventListener("storage", refreshRole);

    return () => window.removeEventListener("storage", refreshRole);
  }, []);

  if (!asset) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Aset tidak ditemukan.
        </div>
      </AppLayout>
    );
  }

  const details = [
    ["Nomor register", asset.no_register],
    ["Dinas / OPD", asset.dinas_opd],
    ["Lokasi", asset.lokasi_aset],
    ["Alamat", asset.alamat],
    [
      "Luas",
      asset.luas_m2
        ? `${asset.luas_m2.toLocaleString("id-ID")} m²`
        : "-",
    ],
    ["Tanggal perolehan", asset.tanggal_perolehan],
    ["Hak", asset.hak],
    ["Nomor sertifikat", asset.no_sertifikat],
    ["Penggunaan", asset.penggunaan],
    ["Asal usul", asset.asal_usul],
    [
      "Nilai perolehan",
      asset.nilai_perolehan
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

  if (!asset) {
    window.alert("Data aset tidak ditemukan.");
    return;
  }

  exportAssetToPdf(asset, document);
}

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/aset"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Kembali ke Data Aset
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {asset.nama_barang_aset}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Detail inventaris aset tanah
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                className="ui-button-outline font-medium text-red-700"
              >
                Ekspor PDF
              </button>

              <Link
                href={`/aset/${asset.id}/edit`}
                className="ui-button ui-button-primary font-medium"
              >
                Edit Aset
              </Link>
            </div>
          )}
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {asset.koordinat_x !== null &&
            asset.koordinat_y !== null && (
              <Link
                href={`/peta?asset=${asset.id}`}
                className="ui-button ui-button-outline mt-5 font-medium text-blue-600"
              >
                Lihat lokasi di peta
              </Link>
            )}
        </section>
      </div>
    </AppLayout>
  );
}
