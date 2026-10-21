
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getAsset, updateAsset } from "@/lib/asset-storage";
import { getAssetStatus } from "@/lib/asset-utils";
import { loadAuthSession } from "@/lib/auth-storage";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315F86] focus:ring-4 focus:ring-[#315F86]/10";

const labelClass = "block text-sm font-medium text-slate-700";

export default function EditAsetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const asset = useMemo(
    () => getAsset(Number(params.id)),
    [params.id],
  );

  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = loadAuthSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.replace(`/aset/${params.id}`);
      return;
    }

    setAuthorized(true);
  }, [params.id, router]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loadAuthSession()?.user.role !== "admin") {
      window.alert("Akses ditolak. Hanya admin yang boleh mengubah aset.");
      router.replace(`/aset/${params.id}`);
      return;
    }

    if (!asset) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("nama") ?? "").trim();
    const address = String(form.get("alamat") ?? "").trim();
    const areaText = String(form.get("luas") ?? "").trim();
    const certificate = String(form.get("sertifikat") ?? "").trim();
    const area = areaText === "" ? null : Number(areaText);

    if (!name || !address) {
      setError("Nama aset dan alamat wajib diisi.");
      return;
    }

    if (
      area !== null &&
      (!Number.isFinite(area) || area < 0)
    ) {
      setError("Luas tanah harus berupa angka nol atau lebih.");
      return;
    }

    const selectedStatus = String(
      form.get("status_sertifikat") ?? "Keterangan Lainnya",
    ) as
      | "Bersertifikat"
      | "Belum Bersertifikat"
      | "Keterangan Lainnya";

    updateAsset(asset.id, {
      nama_barang_aset: name,
      alamat: address,
      dinas_opd:
        String(form.get("opd") ?? "").trim() || asset.dinas_opd,
      penggunaan:
        String(form.get("penggunaan") ?? "").trim() || "-",
      keterangan:
        String(form.get("keterangan") ?? "").trim() || "-",
      luas_m2: area,
      no_sertifikat: certificate || "-",
      status_sertifikat: certificate
        ? "Bersertifikat"
        : selectedStatus === "Bersertifikat"
          ? "Belum Bersertifikat"
          : selectedStatus,
    });

    router.push(`/aset/${asset.id}`);
  }

  if (!authorized) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#315F86]" />
          <p className="mt-4 text-sm text-slate-500">
            Memeriksa hak akses...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!asset) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500">
            !
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#193B5A]">
            Aset tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Data mungkin sudah dihapus atau alamat halaman tidak valid.
          </p>
          <button
            type="button"
            onClick={() => router.push("/aset")}
            className="ui-button ui-button-primary mt-5"
          >
            Kembali ke Data Aset
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
       <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#315F86] transition hover:text-[#193B5A]"
          >
            <span aria-hidden="true">←</span>
            Kembali
          </button>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#66809A]">
            Pengelolaan inventaris
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#193B5A] sm:text-3xl">
            Edit Aset Tanah
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Perbarui informasi aset tanah. Pastikan data yang dimasukkan
            sesuai dengan dokumen inventaris.
          </p>
        </header>

        <form onSubmit={save} className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-[#D7E4F0] bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-[#193B5A]">
                Identitas Aset
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Identitas dasar dan instansi pengelola aset.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <label className={`${labelClass} sm:col-span-2`}>
                Nama aset <span className="text-red-500">*</span>
                <input
                  name="nama"
                  defaultValue={asset.nama_barang_aset}
                  className={inputClass}
                  placeholder="Masukkan nama aset"
                  required
                />
              </label>

              <label className={labelClass}>
                Dinas / OPD
                <input
                  name="opd"
                  defaultValue={asset.dinas_opd}
                  className={inputClass}
                  placeholder="Nama dinas atau OPD"
                />
              </label>

              <label className={labelClass}>
                Nomor register
                <input
                  value={asset.no_register || "-"}
                  className={`${inputClass} bg-slate-50 text-slate-500`}
                  readOnly
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Alamat / Gampong <span className="text-red-500">*</span>
                <input
                  name="alamat"
                  defaultValue={asset.alamat}
                  className={inputClass}
                  placeholder="Masukkan alamat atau nama gampong"
                  required
                />
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-[#193B5A]">
                Data Tanah dan Legalitas
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Luas bidang tanah dan informasi sertifikat.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <label className={labelClass}>
                Luas tanah (m²)
                <input
                  name="luas"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={asset.luas_m2 ?? ""}
                  className={inputClass}
                  placeholder="Contoh: 1250"
                />
              </label>

              <label className={labelClass}>
                Nomor sertifikat
                <input
                  name="sertifikat"
                  defaultValue={
                    asset.no_sertifikat === "-"
                      ? ""
                      : asset.no_sertifikat
                  }
                  className={inputClass}
                  placeholder="Masukkan nomor sertifikat"
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Status sertifikat
                <select
                  name="status_sertifikat"
                  defaultValue={getAssetStatus(asset)}
                  className={inputClass}
                >
                  <option>Bersertifikat</option>
                  <option>Belum Bersertifikat</option>
                  <option>Keterangan Lainnya</option>
                </select>
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Jika nomor sertifikat diisi, status akan menjadi
                  Bersertifikat.
                </span>
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#D7E4F0] bg-white shadow-sm">
            <div className="border-b border-[#D7E4F0] bg-[#F4F8FC] px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-[#193B5A]">
                Penggunaan dan Keterangan
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Informasi tambahan terkait pemanfaatan tanah.
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <label className={labelClass}>
                Penggunaan aset
                <input
                  name="penggunaan"
                  defaultValue={asset.penggunaan}
                  className={inputClass}
                  placeholder="Contoh: Kantor pemerintahan"
                />
              </label>

              <label className={labelClass}>
                Keterangan
                <textarea
                  name="keterangan"
                  defaultValue={asset.keterangan}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315F86] focus:ring-4 focus:ring-[#315F86]/10"
                  placeholder="Tambahkan keterangan aset jika diperlukan"
                />
              </label>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="ui-button-secondary font-medium"
            >
              Batal
            </button>

            <button
              type="submit"
              className="ui-button ui-button-primary font-medium"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
