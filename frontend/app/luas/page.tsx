"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import DistrictStats from "@/components/dashboard/DistrictStats";
import { dummyAssets } from "@/data/dummy-assets";
import { loadAssets } from "@/lib/asset-storage";
import { formatArea, getDistrictSummary } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function LuasAsetPage() {
  const [assets, setAssets] = useState<Asset[]>(dummyAssets);

  useEffect(() => {
    const refresh = () => setAssets(loadAssets());
    refresh();
    window.addEventListener("assets-updated", refresh);
    return () => window.removeEventListener("assets-updated", refresh);
  }, []);

  const districts = useMemo(() => getDistrictSummary(assets), [assets]);
  const totalArea = assets.reduce((total, asset) => total + (asset.luas_m2 ?? 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Analisis inventaris
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Luas Aset per Kecamatan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan luas tanah berdasarkan data aset yang tersimpan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total luas aset
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatArea(totalArea)}</p>
            <p className="mt-1 text-xs text-slate-500">{assets.length} bidang tanah terinventarisasi</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Kecamatan terdata
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{districts.length}</p>
            <p className="mt-1 text-xs text-slate-500">Wilayah dengan data aset</p>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <DistrictStats assets={assets} />
        </section>
      </div>
    </AppLayout>
  );
}
