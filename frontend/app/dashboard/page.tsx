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
    return () => window.removeEventListener("assets-updated", refresh);
  }, []);

  const summary = getAssetSummary(assets);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Pusat data aset daerah</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Katalog aktif · {assets.length} aset tersinkron</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="TOTAL ASET" value={summary.total.toLocaleString("id-ID")} description="Bidang tanah" icon="⌂" variant="blue" />
          <StatCard title="TOTAL LUAS" value={`${summary.totalArea.toLocaleString("id-ID")} m²`} description={`${(summary.totalArea / 10000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} Ha`} icon="□" variant="green" />
          <StatCard title="BERSERTIFIKAT" value={summary.certified.toLocaleString("id-ID")} description={`${summary.total ? Math.round((summary.certified / summary.total) * 100) : 0}% dari total aset`} icon="✓" variant="purple" />
          <StatCard title="BELUM BERSERTIFIKAT" value={summary.uncertified.toLocaleString("id-ID")} description={`${summary.total ? Math.round((summary.uncertified / summary.total) * 100) : 0}% dari total aset`} icon="▤" variant="orange" />
          <StatCard title="KETERANGAN LAINNYA" value={summary.other.toLocaleString("id-ID")} description={`${summary.total ? Math.round((summary.other / summary.total) * 100) : 0}% dari total aset`} icon="i" variant="blue" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><AssetMapPreview assets={assets} /><DistrictStats assets={assets} /></div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><CertificateChart assets={assets} /><RecentAssets assets={assets} /></div>
      </div>
    </AppLayout>
  );
}
