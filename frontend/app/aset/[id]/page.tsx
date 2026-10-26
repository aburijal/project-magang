"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchAssetsFromApi } from "@/lib/asset-api";
import { loadDocuments, AssetDocument } from "@/lib/document-storage";
import { exportAssetToPdf } from "@/lib/asset-export";
import { loadAuthSession } from "@/lib/auth-storage";
import { Asset } from "@/types/asset";

export default function DetailAsetPage() {
  const params = useParams<{ id: string }>();
  const assetId = Number(params.id);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetDocument, setAssetDocument] = useState<AssetDocument | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssetDetail() {
      setIsLoading(true);
      setError("");

      if (!Number.isInteger(assetId) || assetId <= 0) {
        setAsset(null);
        setError("ID aset tidak valid.");
        setIsLoading(false);
        return;
      }

      try {
        const assets = await fetchAssetsFromApi();
        const foundAsset = assets.find((item) => item.id === assetId);

        if (!isMounted) return;

        setAsset(foundAsset ?? null);
        setAssetDocument(
          loadDocuments().find((item) => item.assetId === assetId),
        );

        if (!foundAsset) {
          setError("Aset tidak ditemukan di database.");
        }
      } catch (loadError) {
        if (!isMounted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Data aset gagal dimuat dari server.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAssetDetail();

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  useEffect(() => {
    const refreshRole = () => {
      setIsAdmin(loadAuthSession()?.user.role === "admin");
    };

    refreshRole();
    window.addEventListener("storage", refreshRole);

    return () => window.removeEventListener("storage", refreshRole);
  }, []);

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

    exportAssetToPdf(asset, assetDocument);
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Memuat detail aset dari server...
        </div>
      </AppLayout>
    );
  }

  if (error || !asset) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-700">
            {error || "Aset tidak ditemukan."}
          </p>
          <Link
            href="/aset"
            className="ui-button ui-button-outline mt-4 inline-flex font-medium"
          >
            Kembali ke Data Aset
          </Link>
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
      asset.luas_m2 !== null
        ? `${asset.luas_m2.toLocaleString("id-ID")} m²`
        : "-",
    ],
    ["Tanggal perolehan", asset.tanggal_perolehan || "-"],
    ["Hak", asset.hak || "-"],
    ["Nomor sertifikat", asset.no_sertifikat || "-"],
    ["Penggunaan", asset.penggunaan || "-"],
    ["Asal usul", asset.asal_usul || "-"],
    [
      "Nilai perolehan",
      asset.nilai_perolehan !== null
        ? `Rp ${asset.nilai_perolehan.toLocaleString("id-ID")}`
        : "-",
    ],
    ["Keterangan", asset.keterangan || "-"],
  ];

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
                <p className="mt-1 break-words text-sm text-slate-900">
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