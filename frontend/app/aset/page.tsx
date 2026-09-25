"use client";

import { useState } from "react";
import Link from "next/link";

import AppLayout from "@/components/layout/AppLayout";
import { dummyAssets } from "@/data/dummy-assets";

export default function AsetPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");

  const filteredAssets = dummyAssets.filter((asset) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      asset.nama_barang_aset.toLowerCase().includes(keyword) ||
      String(asset.no).includes(keyword) ||
      String(asset.no_register).includes(keyword) ||
      asset.dinas_opd.toLowerCase().includes(keyword) ||
      asset.alamat.toLowerCase().includes(keyword);

    const assetStatus =
      asset.no_sertifikat !== "-" && asset.no_sertifikat !== ""
        ? "Bersertifikat"
        : "Belum Bersertifikat";

    const matchesStatus =
      status === "Semua Status" || assetStatus === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Data Aset Tanah
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Data inventaris aset tanah Pemerintah Kota Lhokseumawe.
            </p>
          </div>

          <Link
            href="/aset/tambah"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Tambah Aset
          </Link>
        </div>

        {/* Filter */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No, nama aset, register, OPD, atau alamat..."
              className="h-11 flex-1 rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-blue-500"
            >
              <option value="Semua Status">
                Semua Status
              </option>

              <option value="Bersertifikat">
                Bersertifikat
              </option>

              <option value="Belum Bersertifikat">
                Belum Bersertifikat
              </option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1500px] text-sm">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200 text-left">

                  <th className="px-4 py-4 font-semibold">
                    No
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    No. Register
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Nama Barang/Aset
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Dinas / OPD
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Lokasi Aset
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Alamat
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Luas (m²)
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Tanggal Perolehan
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Hak
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Sertifikat
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Penggunaan
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Asal Usul
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Nilai Perolehan
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Keterangan
                  </th>

                  <th className="px-4 py-4 text-center font-semibold">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredAssets.map((asset) => {

                  const bersertifikat =
                    asset.no_sertifikat !== "-" &&
                    asset.no_sertifikat !== "";

                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >

                      <td className="px-4 py-4">
                        {asset.no}
                      </td>

                      <td className="px-4 py-4">
                        {asset.no_register}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-900">
                        {asset.nama_barang_aset}
                      </td>

                      <td className="px-4 py-4">
                        {asset.dinas_opd}
                      </td>

                      <td className="px-4 py-4">
                        {asset.lokasi_aset}
                      </td>

                      <td className="px-4 py-4">
                        {asset.alamat}
                      </td>

                      <td className="px-4 py-4">
                        {asset.luas_m2 !== null
                          ? asset.luas_m2.toLocaleString("id-ID")
                          : "-"}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {asset.tanggal_perolehan}
                      </td>

                      <td className="px-4 py-4">
                        {asset.hak}
                      </td>

                      <td className="px-4 py-4">

                        <div className="space-y-1">
                          <div>
                            Tgl: {asset.tanggal_sertifikat}
                          </div>

                          <div>
                            No: {asset.no_sertifikat}
                          </div>
                        </div>

                      </td>

                      <td className="px-4 py-4">
                        {asset.penggunaan}
                      </td>

                      <td className="px-4 py-4">
                        {asset.asal_usul}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {asset.nilai_perolehan !== null
                          ? `Rp ${asset.nilai_perolehan.toLocaleString(
                              "id-ID"
                            )}`
                          : "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            bersertifikat
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                              : "rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700"
                          }
                        >
                          {asset.keterangan}
                        </span>
                      </td>

                      <td className="px-4 py-4">

                        <div className="flex gap-2">

                          <Link
                            href={`/aset/${asset.id}`}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                          >
                            Detail
                          </Link>

                          <Link
                            href={`/aset/${asset.id}/edit`}
                            className="rounded-md border border-blue-200 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </Link>

                        </div>

                      </td>

                    </tr>
                  );
                })}

                {filteredAssets.length === 0 && (
                  <tr>
                    <td
                      colSpan={15}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Data aset tidak ditemukan.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            Menampilkan {filteredAssets.length} dari{" "}
            {dummyAssets.length} data aset
          </div>

        </div>

      </div>
    </AppLayout>
  );
}