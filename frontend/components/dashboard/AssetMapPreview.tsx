import Link from "next/link";
import AssetMap from "@/components/map/AssetMap";
import { Asset } from "@/types/asset";

export default function AssetMapPreview({
  assets,
}: {
  assets: Asset[];
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3">
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

          <div className="min-w-0">
            <h2 className="font-semibold text-[#193B5A]">
              Peta Sebaran Aset Tanah
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Persebaran lokasi berdasarkan koordinat aset
            </p>
          </div>
        </div>

        <Link
          href="/peta"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#193B5A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#315F86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
        >
          Lihat Peta Lengkap
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M7 17 17 7M7 7h10v10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Map */}
      <div className="relative bg-[#F4F6F8]">
        <AssetMap heightClassName="h-[350px]" assets={assets} />
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-[#4B806E]" />
          Pratinjau lokasi aset
        </div>
        <span className="text-xs text-slate-400">
          {assets.length.toLocaleString("id-ID")} data aset
        </span>
      </div>
    </section>
  );
}