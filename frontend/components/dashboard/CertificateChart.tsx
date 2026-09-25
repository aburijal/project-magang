const certificateData = [
  {
    label: "Bersertifikat",
    value: 97,
    percentage: "76%",
  },
  {
    label: "Belum Bersertifikat",
    value: 31,
    percentage: "24%",
  },
];

export default function CertificateChart() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-slate-900">
          Status Sertifikat
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Komposisi status aset
        </p>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-[18px] border-blue-500">
          <div className="text-center">
            <strong className="block text-2xl font-bold text-slate-900">
              128
            </strong>

            <span className="text-xs text-slate-500">
              Aset
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {certificateData.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-blue-500" />

              <div>
                <p className="text-sm font-medium text-slate-700">
                  {item.label}
                </p>

                <p className="text-xs text-slate-500">
                  {item.value} aset · {item.percentage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}