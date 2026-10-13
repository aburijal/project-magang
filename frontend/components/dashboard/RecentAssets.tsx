import Link from "next/link";
import { formatArea } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function RecentAssets({ assets }: { assets: Asset[] }) {
  const recentAssets = assets.slice(-3).reverse();

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Data Aset Terbaru
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pembaruan terakhir dari katalog aset
          </p>
        </div>

        <Link
          href="/aset"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Lihat semua →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Kode</th>
              <th className="px-5 py-3">Nama Aset</th>
              <th className="px-5 py-3">Lokasi</th>
              <th className="px-5 py-3">Luas</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recentAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-blue-600">
                  AT-{String(asset.no).padStart(3, "0")}
                </td>

                <td className="px-5 py-4 text-slate-700">
                  {asset.nama_barang_aset}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {asset.lokasi_aset.replace(/^Kecamatan\s+/i, "")}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {formatArea(asset.luas_m2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}