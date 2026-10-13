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
    const query = search.toLowerCase();
    const matchesSearch = !query || asset.nama_barang_aset.toLowerCase().includes(query) || asset.alamat.toLowerCase().includes(query);
    const matchesDistrict = !district || asset.lokasi_aset.toLowerCase().includes(district.toLowerCase());
    const matchesStatus = !status || getAssetStatus(asset) === status;
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Eksplorasi lokasi</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Peta Aset Tanah</h1>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{filteredAssets.length} aset ditemukan</span>
        </div>

        {/* Map Card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Filter */}
          <div className="border-b border-slate-200 p-5">
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
          <AssetMap assets={filteredAssets} resetSignal={pinResetSignal} />

          {/* Legend */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-5">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                Bersertifikat
              </span>

              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                Belum Bersertifikat
              </span>

              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                Dalam Proses
              </span>
            </div>

            <span className="text-xs text-slate-400">Tekan dan tahan 1,5 detik untuk menempatkan pin · geser pin untuk mengatur ulang</span>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}