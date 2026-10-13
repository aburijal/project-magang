import AssetMap from "@/components/map/AssetMap";
import { Asset } from "@/types/asset";

export default function AssetMapPreview({ assets }: { assets: Asset[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Peta Sebaran Aset Tanah
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Lokasi aset berdasarkan koordinat
          </p>
        </div>

        <a
          href="/peta"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Lihat Peta Lengkap ↗
        </a>
      </div>

      <AssetMap heightClassName="h-[350px]" assets={assets} />
    </section>
  );
}