const recentAssets = [
  {
    code: "AT-128",
    name: "Tanah Kantor Pemerintah",
    location: "Banda Sakti",
    area: "2.500 m²",
  },
  {
    code: "AT-127",
    name: "Tanah Sekolah",
    location: "Muara Dua",
    area: "4.200 m²",
  },
  {
    code: "AT-126",
    name: "Tanah Fasilitas Umum",
    location: "Muara Satu",
    area: "1.850 m²",
  },
];

export default function RecentAssets() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Data Aset Terbaru
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Data simulasi prototype
          </p>
        </div>

        <a
          href="/aset"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Lihat semua →
        </a>
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
              <tr key={asset.code} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-blue-600">
                  {asset.code}
                </td>

                <td className="px-5 py-4 text-slate-700">
                  {asset.name}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {asset.location}
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {asset.area}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}