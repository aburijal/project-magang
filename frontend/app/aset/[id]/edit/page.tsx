"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { fetchAssetsFromApi } from "@/lib/asset-api";
import { loadAuthSession } from "@/lib/auth-storage";
import { Asset } from "@/types/asset";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function EditAsetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assetId = Number(params.id);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const session = loadAuthSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (session.user.role !== "admin") {
        router.replace(`/aset/${params.id}`);
        return;
      }

      if (active) setAuthorized(true);

      try {
        const assets = await fetchAssetsFromApi();
        const found = assets.find((item) => item.id === assetId);

        if (!active) return;

        if (!found) {
          setError("Aset tidak ditemukan di database.");
        }

        setAsset(found ?? null);
      } catch (loadError) {
        if (!active) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal mengambil data aset dari server.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [assetId, params.id, router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const session = loadAuthSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.role !== "admin") {
      window.alert("Akses ditolak. Hanya admin yang boleh mengubah aset.");
      router.replace(`/aset/${params.id}`);
      return;
    }

    if (!asset) {
      setError("Data aset tidak ditemukan.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const areaText = String(form.get("luas") ?? "").trim();
    const usage = String(form.get("penggunaan") ?? "").trim();
    const description = String(form.get("keterangan") ?? "").trim();

    const area = areaText === "" ? null : Number(areaText);

    if (area !== null && (!Number.isFinite(area) || area < 0)) {
      setError("Luas harus berupa angka nol atau lebih.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/land-assets/${asset.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            area,
            usage: usage || null,
            description: description || null,
          }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi login tidak valid. Silakan login kembali.");
        }

        if (response.status === 403) {
          throw new Error("Akses ditolak oleh server. Hanya admin yang boleh mengubah aset.");
        }

        const validationErrors = result?.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            result?.message ||
            "Perubahan aset gagal disimpan.",
        );
      }

      router.push(`/aset/${asset.id}`);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof TypeError
          ? "Server Laravel tidak dapat dihubungi. Pastikan backend berjalan."
          : saveError instanceof Error
            ? saveError.message
            : "Terjadi kesalahan saat menyimpan perubahan.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!authorized || isLoading) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500">
          Memeriksa akses dan memuat data aset...
        </div>
      </AppLayout>
    );
  }

  if (!asset) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          {error || "Aset tidak ditemukan."}
          <div>
            <button
              type="button"
              onClick={() => router.push("/aset")}
              className="ui-button ui-button-outline mt-4 font-medium"
            >
              Kembali ke Data Aset
            </button>
          </div>
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

          <p className="mt-1 text-sm text-slate-500">
            Data dibaca dari database Laravel.
          </p>
        </div>

        <form
          onSubmit={save}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">
            Nama aset
            <input
              value={asset.nama_barang_aset}
              className={`${inputClass} bg-slate-50`}
              readOnly
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Nama aset belum memiliki kolom tersendiri di database.
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Alamat
            <input
              value={asset.alamat}
              className={`${inputClass} bg-slate-50`}
              readOnly
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Dinas / OPD
            <input
              value={asset.dinas_opd}
              className={`${inputClass} bg-slate-50`}
              readOnly
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Nomor register
              <input
                value={asset.no_register}
                className={`${inputClass} bg-slate-50`}
                readOnly
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

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Penggunaan
              <input
                name="penggunaan"
                defaultValue={asset.penggunaan === "-" ? "" : asset.penggunaan}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Keterangan
            <textarea
              name="keterangan"
              defaultValue={asset.keterangan === "-" ? "" : asset.keterangan}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Nomor sertifikat dan status sertifikat dikelola melalui data
            sertifikat terpisah. Form ini belum mengubah data sertifikat.
          </p>

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
              disabled={isSaving}
            >
              Batal
            </button>

            <button
              type="submit"
              className="ui-button-primary font-medium"
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
