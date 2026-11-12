import Link from "next/link";
import { formatArea } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function RecentAssets({ assets }: { assets: Asset[] }) {
  const recentAssets = assets.slice(-3).reverse();

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7EFF8] text-[#315F86]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M4 5.5h16v14H4zM8 9h8M8 12.5h8M8 16h5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2 className="font-semibold text-[#193B5A]">
              Data Aset Terbaru
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Data terakhir dari katalog aset tanah
            </p>
          </div>
        </div>

        <Link
          href="/aset"
          className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#315F86] transition-colors hover:border-[#315F86] hover:bg-[#E7EFF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
        >
          Lihat semua
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-3 font-semibold">
                Kode
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Nama Aset
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Lokasi
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Luas
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recentAssets.length > 0 ? (
              recentAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="transition-colors hover:bg-[#F4F7FB]"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex items-center rounded-md bg-[#E7EFF8] px-2 py-1 text-xs font-semibold text-[#315F86]">
                      AT-{String(asset.no).padStart(3, "0")}
                    </span>
                  </td>

                  <td className="max-w-[220px] px-5 py-4">
                    <p
                      className="truncate font-medium text-slate-700"
                      title={asset.nama_barang_aset}
                    >
                      {asset.nama_barang_aset}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4 shrink-0 text-slate-400"
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

                      <span className="whitespace-nowrap">
                        {asset.lokasi_aset.replace(/^Kecamatan\s+/i, "")}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right font-medium tabular-nums text-[#193B5A]">
                    {formatArea(asset.luas_m2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7EFF8] text-[#315F86]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 5h16v14H4zM8 9h8M8 13h5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Belum ada data aset
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Data aset akan muncul setelah tersedia dalam katalog.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
        <span className="text-xs text-slate-500">
          Menampilkan maksimal 3 aset
        </span>
        <span className="text-xs font-medium text-[#315F86]">
          {recentAssets.length} data
        </span>
      </div>
    </section>
  );
}