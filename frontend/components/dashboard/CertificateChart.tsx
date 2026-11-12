import { getAssetSummary } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

export default function CertificateChart({ assets }: { assets: Asset[] }) {
  const summary = getAssetSummary(assets);

  const certificateData = [
    {
      label: "Bersertifikat",
      value: summary.certified,
      color: "#4B806E",
      dot: "bg-[#4B806E]",
    },
    {
      label: "Belum Bersertifikat",
      value: summary.uncertified,
      color: "#AD8748",
      dot: "bg-[#AD8748]",
    },
    {
      label: "Keterangan Lainnya",
      value: summary.other,
      color: "#315F86",
      dot: "bg-[#315F86]",
    },
  ];

  let currentPercentage = 0;

  const gradientStops = certificateData.map((item) => {
    const percentage = summary.total > 0
      ? (item.value / summary.total) * 100
      : 0;

    const start = currentPercentage;
    currentPercentage += percentage;

    return `${item.color} ${start}% ${currentPercentage}%`;
  });

  const chartBackground =
    summary.total > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "#E2E8F0";

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7EFF8] text-[#315F86]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m8.5 12 2.3 2.3 4.7-4.8"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <h2 className="font-semibold text-[#193B5A]">
            Status Sertifikat
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Komposisi status sertifikat aset tanah
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex flex-col items-center gap-7 p-5 sm:flex-row sm:items-center sm:gap-8">
        <div
          className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full p-[13px]"
          style={{ background: chartBackground }}
          role="img"
          aria-label={`Komposisi status dari ${summary.total} aset`}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
            <strong className="text-2xl font-bold tracking-tight text-[#193B5A]">
              {summary.total.toLocaleString("id-ID")}
            </strong>
            <span className="mt-1 text-xs text-slate-500">
              Total aset
            </span>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-5">
          {certificateData.map((item) => {
            const percentage = summary.total
              ? Math.round((item.value / summary.total) * 100)
              : 0;

            return (
              <div key={item.label}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5 text-slate-700">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.value.toLocaleString("id-ID")} aset
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[#193B5A]">
                    {percentage}%
                  </span>
                </div>

                <div
                  className="ml-5 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`${item.label}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${item.dot}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Persentase dihitung berdasarkan total aset yang tercatat dalam katalog.
        </p>
      </div>
    </section>
  );
}