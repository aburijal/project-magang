import { formatArea, getDistrictSummary } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function DistrictStats({ assets }: { assets: Asset[] }) {
  const districts = getDistrictSummary(assets);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-slate-900">
          Luas Aset per Kecamatan
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan luas tanah terinventarisasi
        </p>
      </div>

      <div className="space-y-5">
        {districts.map((district) => (
          <div key={district.name}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {district.name}
              </span>

              <span className="text-slate-500">
                {formatArea(district.area)}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${district.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}