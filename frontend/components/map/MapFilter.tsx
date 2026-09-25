"use client";

interface MapFilterProps {
  search: string;
  district: string;
  status: string;
  onSearchChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const districts = [
  "Banda Sakti",
  "Muara Dua",
  "Muara Satu",
  "Blang Mangat",
];

export default function MapFilter({
  search,
  district,
  status,
  onSearchChange,
  onDistrictChange,
  onStatusChange,
  onReset,
}: MapFilterProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Cari kode atau nama aset..."
        className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <select
        value={district}
        onChange={(e) => onDistrictChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
      >
        <option value="">Semua Kecamatan</option>

        {districts.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
      >
        <option value="">Semua Status</option>
        <option value="Bersertifikat">
          Bersertifikat
        </option>
        <option value="Belum Bersertifikat">
          Belum Bersertifikat
        </option>
        <option value="Dalam Proses">
          Dalam Proses
        </option>
      </select>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Reset
      </button>
    </div>
  );
}