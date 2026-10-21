
"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import AssetMapPreview from "@/components/dashboard/AssetMapPreview";
import DistrictStats from "@/components/dashboard/DistrictStats";
import CertificateChart from "@/components/dashboard/CertificateChart";
import RecentAssets from "@/components/dashboard/RecentAssets";
import { dummyAssets } from "@/data/dummy-assets";
import { loadAssets } from "@/lib/asset-storage";
import { getAssetSummary } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);

  useEffect(() => {
    const refresh = () => setAssets(loadAssets());

    refresh();

    window.addEventListener("assets-updated", refresh);

    return () => {
      window.removeEventListener("assets-updated", refresh);
    };
  }, []);

  const summary = getAssetSummary(assets);

  const certifiedPercentage = summary.total
    ? Math.round((summary.certified / summary.total) * 100)
    : 0;

  const uncertifiedPercentage = summary.total
    ? Math.round((summary.uncertified / summary.total) * 100)
    : 0;

  const otherPercentage = summary.total
    ? Math.round((summary.other / summary.total) * 100)
    : 0;

  return (
    <AppLayout>
      <main className="min-w-0 space-y-6 pb-6">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1 w-7 rounded-full bg-[#AD8748]" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#315F86]">
                Sistem Informasi Aset Daerah
              </p>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#193B5A] sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ringkasan data, luas, status sertifikat, dan persebaran aset tanah
              Pemerintah Kota Lhokseumawe.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCEDE7]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-[#4B806E]"
                aria-hidden="true"
              >
                <path
                  d="m5 12 4 4L19 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <div>
              <p className="text-xs text-slate-500">Status katalog</p>
              <p className="mt-0.5 text-sm font-semibold text-[#193B5A]">
                Aktif
              </p>
              <p className="text-xs text-slate-500">
                {assets.length.toLocaleString("id-ID")} aset terdata
              </p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section aria-label="Ringkasan aset tanah">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Ringkasan Aset Tanah
            </h2>
            <span className="text-xs text-slate-400">
              Berdasarkan data katalog
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            <StatCard
              title="TOTAL ASET"
              value={summary.total.toLocaleString("id-ID")}
              description="Bidang tanah"
              icon="⌂"
              variant="blue"
              href="/aset"
            />

            <StatCard
              title="TOTAL LUAS"
              value={`${summary.totalArea.toLocaleString("id-ID")} m²`}
              description={`${(summary.totalArea / 10000).toLocaleString(
                "id-ID",
                { maximumFractionDigits: 2 }
              )} Ha`}
              icon="□"
              variant="green"
              href="/luas"
            />

            <StatCard
              title="BERSERTIFIKAT"
              value={summary.certified.toLocaleString("id-ID")}
              description={`${certifiedPercentage}% dari total aset`}
              icon="✓"
              variant="purple"
              href="/aset?status=Bersertifikat"
            />

            <StatCard
              title="BELUM BERSERTIFIKAT"
              value={summary.uncertified.toLocaleString("id-ID")}
              description={`${uncertifiedPercentage}% dari total aset`}
              icon="▤"
              variant="orange"
              href="/aset?status=Belum%20Bersertifikat"
            />

            <StatCard
              title="KETERANGAN LAINNYA"
              value={summary.other.toLocaleString("id-ID")}
              description={`${otherPercentage}% dari total aset`}
              icon="i"
              variant="blue"
              href="/aset?status=Keterangan%20Lainnya"
            />
          </div>
        </section>

        {/* Map and regional statistics */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Persebaran dan Wilayah
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Informasi lokasi dan distribusi aset tanah.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <AssetMapPreview assets={assets} />
            <DistrictStats assets={assets} />
          </div>
        </section>

        {/* Certificate chart and recent assets */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Status dan Data Aset
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Pantau status sertifikat dan data aset terbaru.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
            <CertificateChart assets={assets} />
            <RecentAssets assets={assets} />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-4">
          <p className="text-xs leading-5 text-slate-400">
            Katalog Aset Tanah Pemerintah Kota Lhokseumawe
          </p>
        </footer>
      </main>
    </AppLayout>
  );
}
