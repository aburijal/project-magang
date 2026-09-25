export default function AssetMapPreview() {
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

      <div className="relative h-[350px] bg-slate-100">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-4xl text-slate-400">⌖</div>

            <p className="mt-2 font-medium text-slate-600">
              Peta Aset Tanah
            </p>

            <p className="text-sm text-slate-400">
              Peta interaktif akan ditampilkan di sini.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}