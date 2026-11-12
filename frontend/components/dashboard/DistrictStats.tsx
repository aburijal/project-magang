import { formatArea, getDistrictSummary } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function DistrictStats({ assets }: { assets: Asset[] }) {
  const districts = getDistrictSummary(assets);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7EFF8] text-[#315F86]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M4 20V10m8 10V4m8 16v-7M2 20h20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2 className="font-semibold text-[#193B5A]">
              Luas Aset per Kecamatan
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Ringkasan luas tanah terinventarisasi berdasarkan wilayah
            </p>
          </div>
        </div>
      </div>

      {/* District list */}
      <div className="p-5">
        {districts.length > 0 ? (
          <div className="space-y-5">
            {districts.map((district, index) => {
              const percentage = Math.max(
                0,
                Math.min(100, district.percentage)
              );

              return (
                <div key={district.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-[#315F86]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="truncate text-sm font-medium text-slate-700">
                        {district.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-semibold tabular-nums text-[#193B5A]">
                      {formatArea(district.area)}
                    </span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`Proporsi luas aset ${district.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage}
                  >
                    <div
                      className="h-full rounded-full bg-[#315F86] transition-[width] duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {percentage.toLocaleString("id-ID", {
                      maximumFractionDigits: 1,
                    })}
                    % dari total
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7EFF8] text-[#315F86]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 5h16M4 12h16M4 19h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-sm font-medium text-slate-700">
              Belum ada data wilayah
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Statistik akan ditampilkan setelah data aset tersedia.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
        <span className="text-xs text-slate-500">
          Jumlah kecamatan
        </span>
        <span className="text-sm font-semibold text-[#193B5A]">
          {districts.length}
        </span>
      </div>
    </section>
  );
}