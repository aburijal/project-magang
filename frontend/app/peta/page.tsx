"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import AssetMap from "@/components/map/AssetMap";
import MapFilter from "@/components/map/MapFilter";
import { dummyAssets } from "@/data/dummy-assets";
import { loadAssets } from "@/lib/asset-storage";
import { getAssetStatus } from "@/lib/asset-utils";

export default function PetaPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [pinResetSignal, setPinResetSignal] = useState(0);
  const [assets, setAssets] = useState(dummyAssets);

  const [targetAssetId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;

    const assetParam = new URLSearchParams(window.location.search).get("asset");
    const parsedAssetId = assetParam ? Number(assetParam) : NaN;

    return Number.isFinite(parsedAssetId) ? parsedAssetId : null;
  });

  useEffect(() => {
    const refresh = () => setAssets(loadAssets());

    refresh();
    window.addEventListener("assets-updated", refresh);

    return () => window.removeEventListener("assets-updated", refresh);
  }, []);

  const handleReset = () => {
    setSearch("");
    setDistrict("");
    setStatus("");
    setPinResetSignal((signal) => signal + 1);
  };

  const filteredAssets = assets.filter((asset) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      asset.nama_barang_aset.toLowerCase().includes(query) ||
      asset.alamat.toLowerCase().includes(query);

    const matchesDistrict =
      !district ||
      asset.lokasi_aset.toLowerCase().includes(district.toLowerCase());

    const matchesStatus = !status || getAssetStatus(asset) === status;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const activeFilterCount = [search.trim(), district, status].filter(
    Boolean
  ).length;

  return (
    <AppLayout>
      <main className="min-w-0 space-y-6 pb-6">
        {/* Page header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1 w-7 rounded-full bg-[#AD8748]" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#315F86]">
                Sistem Informasi Aset Daerah
              </p>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#193B5A] sm:text-3xl">
              Peta Aset Tanah
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Telusuri lokasi dan persebaran aset tanah berdasarkan alamat,
              kecamatan, dan status sertifikat.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7EFF8] text-[#315F86]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs text-slate-500">Hasil pencarian</p>
              <p className="mt-0.5 text-lg font-bold text-[#193B5A]">
                {filteredAssets.length.toLocaleString("id-ID")}
                <span className="ml-1 text-xs font-medium text-slate-500">
                  dari {assets.length.toLocaleString("id-ID")} aset
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Map container */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Map heading */}
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7EFF8] text-[#315F86]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6.5 8.5 4 15.5 7 21 4.5v13L15.5 20 8.5 17 3 19.5v-13Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.5 4v13M15.5 7v13"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </div>

              <div>
                <h2 className="font-semibold text-[#193B5A]">
                  Peta Persebaran
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Pilih layer peta dan klik marker untuk melihat detail aset.
                </p>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#315F86] transition hover:border-[#315F86] hover:bg-[#E7EFF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M7 7V4h10v3m-9 0 1 13h6l1-13M10 11v5m4-5v5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Reset filter
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5">
            <MapFilter
              search={search}
              district={district}
              status={status}
              onSearchChange={setSearch}
              onDistrictChange={setDistrict}
              onStatusChange={setStatus}
              onReset={handleReset}
            />
          </div>

          {/* Map */}
          <div className="relative">
            <AssetMap
              assets={filteredAssets}
              resetSignal={pinResetSignal}
              targetAssetId={targetAssetId}
            />
          </div>

          {/* Legend */}
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Legenda status
                </span>

                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4B806E]" />
                  Bersertifikat
                </span>

                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F97316]" />
                  Belum Bersertifikat
                </span>

                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#315F86]" />
                  Keterangan Lainnya
                </span>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-[#E7EFF8] bg-[#F4F7FB] px-3 py-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#315F86]"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M12 11v5m0-8h.01"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

                <p className="text-xs leading-5 text-slate-600">
                  Untuk menempatkan pin koordinat, tekan dan tahan peta selama
                  1,5 detik. Pin dapat digeser untuk menyesuaikan posisi.
                  Gunakan tombol salin pada popup untuk menyalin koordinat.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}