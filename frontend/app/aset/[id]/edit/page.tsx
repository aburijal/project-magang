
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getAsset, updateAsset } from "@/lib/asset-storage";
import { getAssetStatus } from "@/lib/asset-utils";
import { loadAuthSession } from "@/lib/auth-storage";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

    // Periksa kembali role saat penyimpanan.
    if (loadAuthSession()?.user.role !== "admin") {
      window.alert("Akses ditolak. Hanya admin yang boleh mengubah aset.");
      router.replace(`/aset/${params.id}`);
      return;
    }

    if (!asset) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("nama") ?? "").trim();
    const address = String(form.get("alamat") ?? "").trim();

    if (!name || !address) {
      setError("Nama aset dan alamat wajib diisi.");
      return;
    }

    updateAsset(asset.id, {
      nama_barang_aset: name,
      alamat: address,
      dinas_opd:
        String(form.get("opd") ?? "").trim() || asset.dinas_opd,
      penggunaan:
        String(form.get("penggunaan") ?? "").trim() || "-",
      keterangan:
        String(form.get("keterangan") ?? "").trim() || "-",
      luas_m2: Number(form.get("luas") ?? 0) || null,
      no_sertifikat:
        String(form.get("sertifikat") ?? "").trim() || "-",
      status_sertifikat: String(
        form.get("status_sertifikat") ?? "Keterangan Lainnya",
      ) as
        | "Bersertifikat"
        | "Belum Bersertifikat"
        | "Keterangan Lainnya",
    });

    router.push(`/aset/${asset.id}`);
  }

  if (!authorized) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500">
          Memeriksa hak akses...
        </div>
      </AppLayout>
    );
  }

  if (!asset) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Aset tidak ditemukan.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="ui-button ui-button-outline text-sm font-medium text-blue-600"
          >
            ← Kembali
          </button>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Edit Aset Tanah
          </h1>
        </div>

        <form
          onSubmit={save}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">
            Nama aset *
            <input
              name="nama"
              defaultValue={asset.nama_barang_aset}
              className={inputClass}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Alamat *
            <input
              name="alamat"
              defaultValue={asset.alamat}
              className={inputClass}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Dinas / OPD
              <input
                name="opd"
                defaultValue={asset.dinas_opd}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Luas (m²)
              <input
                name="luas"
                type="number"
                min="0"
                step="0.01"
                defaultValue={asset.luas_m2 ?? ""}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Nomor sertifikat
              <input
                name="sertifikat"
                defaultValue={
                  asset.no_sertifikat === "-"
                    ? ""
                    : asset.no_sertifikat
                }
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
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
            </label>

            <label className="text-sm font-medium text-slate-700">
              Penggunaan
              <input
                name="penggunaan"
                defaultValue={asset.penggunaan}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Keterangan
            <textarea
              name="keterangan"
              defaultValue={asset.keterangan}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="ui-button-secondary"
            >
              Batal
            </button>

            <button
              type="submit"
              className="ui-button-primary font-medium"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
