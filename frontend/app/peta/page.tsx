"use client";

import { useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import AssetMap from "@/components/map/AssetMap";
import MapFilter from "@/components/map/MapFilter";

export default function PetaPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");

  const handleReset = () => {
    setSearch("");
    setDistrict("");
    setStatus("");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Peta Aset Tanah
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Eksplorasi lokasi aset tanah secara interaktif.
          </p>
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
          <AssetMap />

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

            <span className="text-xs text-slate-400">
              Gunakan kontrol layer di kanan atas untuk Peta
              Jalan / Satelit.
            </span>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}