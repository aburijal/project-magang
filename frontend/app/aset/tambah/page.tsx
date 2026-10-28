
"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { loadAuthSession } from "@/lib/auth-storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]";

type PhotoItem = {
  file: File;
  preview: string;
};

type ApiResult = {
  message?: string;
  data?: {
    id?: number;
  };
  errors?: Record<string, string[]>;
};

async function readFile(file: File): Promise<PhotoItem> {
  const preview = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error(`Foto ${file.name} tidak dapat dibaca.`));

    reader.readAsDataURL(file);
  });

  return { file, preview };
}

async function apiRequest(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<ApiResult> {
  const response = await fetch(`${API_URL}/${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = (await response.json().catch(() => null)) as ApiResult | null;

  if (!response.ok) {
    const validationErrors = result?.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    if (response.status === 401) {
      throw new Error("Sesi login tidak valid. Silakan login kembali.");
    }

    if (response.status === 403) {
      throw new Error("Akses ditolak. Hanya admin yang boleh menambahkan aset.");
    }

    throw new Error(
      validationErrors || result?.message || `Permintaan gagal (${response.status}).`,
    );
  }

  return result ?? {};
}

export default function TambahAsetPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingPhotos, setIsReadingPhotos] = useState(false);
  const [denahPhoto, setDenahPhoto] = useState<PhotoItem | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<PhotoItem[]>([]);

  async function handleDenahChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setIsReadingPhotos(true);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("File denah harus berupa gambar.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran denah maksimal 5 MB.");
      }

      setDenahPhoto(await readFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Denah gagal dibaca.");
    } finally {
      setIsReadingPhotos(false);
    }
  }

  async function handleAdditionalPhotosChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;

    setError("");
    setIsReadingPhotos(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} bukan file gambar.`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} melebihi batas 5 MB.`);
        }
      }

      const photos = await Promise.all(files.map(readFile));
      setAdditionalPhotos((current) => [...current, ...photos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Foto gagal dibaca.");
    } finally {
      setIsReadingPhotos(false);
    }
  }

  function removeAdditionalPhoto(index: number) {
    setAdditionalPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const session = loadAuthSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.role !== "admin") {
      setError("Hanya admin yang boleh menambahkan aset.");
      return;
    }

    if (isReadingPhotos) {
      setError("Tunggu sampai semua foto selesai diproses.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const name = String(form.get("nama") ?? "").trim();
    const address = String(form.get("alamat") ?? "").trim();
    const district = String(form.get("kecamatan") ?? "").trim();
    const opdName = String(form.get("opd") ?? "").trim();
    const registerNumber = String(form.get("register") ?? "").trim();
    const areaText = String(form.get("luas") ?? "").trim();
    const acquisitionDate = String(form.get("tanggal") ?? "").trim();
    const landRightName = String(form.get("hak") ?? "Hak Pakai");
    const certificateNumber = String(form.get("no_sertifikat") ?? "").trim();
    const certificateStatus = String(
      form.get("status_sertifikat") ?? "Keterangan Lainnya",
    );
    const usage = String(form.get("penggunaan") ?? "").trim();
    const acquisitionSourceName = String(
      form.get("asal_usul") ?? "Pembelian",
    );
    const latitudeText = String(form.get("latitude") ?? "").trim();
    const longitudeText = String(form.get("longitude") ?? "").trim();
    const priceText = String(form.get("nilai") ?? "").trim();
    const description = String(form.get("keterangan") ?? "").trim();

    if (!name || !address || !district) {
      setError("Lengkapi nama aset, alamat, dan kecamatan.");
      return;
    }

    if (!denahPhoto) {
      setError("Upload denah lokasi aset terlebih dahulu.");
      return;
    }

    if (latitudeText !== "" && longitudeText === "") {
      setError("Longitude wajib diisi jika latitude diisi.");
      return;
    }

    if (longitudeText !== "" && latitudeText === "") {
      setError("Latitude wajib diisi jika longitude diisi.");
      return;
    }

    const area = areaText === "" ? null : Number(areaText);
    const price = priceText === "" ? null : Number(priceText);
    const latitude = latitudeText === "" ? null : Number(latitudeText);
    const longitude = longitudeText === "" ? null : Number(longitudeText);

    if (area !== null && (!Number.isFinite(area) || area < 0)) {
      setError("Luas tanah harus berupa angka nol atau lebih.");
      return;
    }

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError("Nilai perolehan harus berupa angka nol atau lebih.");
      return;
    }

    if (
      latitude !== null &&
      (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
    ) {
      setError("Latitude harus berada antara -90 dan 90.");
      return;
    }

    if (
      longitude !== null &&
      (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
    ) {
      setError("Longitude harus berada antara -180 dan 180.");
      return;
    }

    setIsSaving(true);

    let createdAssetId: number | null = null;

    try {
      // 1. Simpan data utama aset.
      const assetResult = await apiRequest("land-assets", session.token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          opd_name: opdName || null,
          kecamatan: district,
          alamat: address,
          register_number: registerNumber || null,
          area,
          acquisition_date: acquisitionDate || null,
          land_right_name: landRightName,
          acquisition_source_name: acquisitionSourceName,
          usage: usage || null,
          price,
          description: description || null,
        }),
      });

      const assetId = assetResult.data?.id;

      if (!assetId) {
        throw new Error("Aset tersimpan atau diproses, tetapi ID aset tidak diterima dari API.");
      }

      createdAssetId = assetId;

      // 2. Simpan status dan nomor sertifikat.
      const normalizedCertificateStatus =
        certificateStatus === "Bersertifikat"
          ? "bersertifikat"
          : certificateStatus === "Belum Bersertifikat"
            ? "belum_bersertifikat"
            : "belum_diketahui";

      await apiRequest(`land-assets/${assetId}/certificates`, session.token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate_number: certificateNumber || null,
          certificate_date: null,
          status: normalizedCertificateStatus,
          description: null,
        }),
      });

      // 3. Simpan koordinat jika keduanya diisi.
      if (latitude !== null && longitude !== null) {
        await apiRequest(`land-assets/${assetId}/coordinates`, session.token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude,
            longitude,
            coordinate_format: "decimal",
            description: null,
          }),
        });
      }

      // 4. Upload denah dan foto sebagai file asli.
      const uploadPhoto = async (
        photo: PhotoItem,
        photoType: "denah" | "foto_tambahan",
      ) => {
        const upload = new FormData();
        upload.append("photo", photo.file);
        upload.append("photo_type", photoType);

        await apiRequest(`land-assets/${assetId}/photos`, session.token, {
          method: "POST",
          body: upload,
        });
      };

      await uploadPhoto(denahPhoto, "denah");

      for (const photo of additionalPhotos) {
        await uploadPhoto(photo, "foto_tambahan");
      }

      router.push("/aset");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Server Laravel tidak dapat dihubungi. Periksa koneksi backend."
          : err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyimpan aset.";

      setError(
        createdAssetId !== null
          ? `Aset dengan ID ${createdAssetId} sudah dibuat, tetapi penyimpanan sertifikat, koordinat, atau foto mungkin belum lengkap. Detail: ${message} Jangan kirim ulang seluruh form sebelum memeriksa data aset tersebut.`
          : message,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="ui-button ui-button-outline text-sm font-medium text-blue-600"
          >
            ← Kembali ke Data Aset
          </button>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Tambah Aset Tanah
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Masukkan data aset tanah baru ke katalog inventaris.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <section>
          <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-[#193B5A]">Identitas Aset</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Nama aset *
                <input
                  name="nama"
                  required
                  className={inputClass}
                  placeholder="Contoh: Tanah Kantor Kecamatan"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Kecamatan *
                <select
                  name="kecamatan"
                  required
                  className={inputClass}
                  defaultValue=""
                >
                  <option value="">Pilih kecamatan</option>
                  <option>Banda Sakti</option>
                  <option>Muara Dua</option>
                  <option>Muara Satu</option>
                  <option>Blang Mangat</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Alamat / Gampong *
                <input
                  name="alamat"
                  required
                  className={inputClass}
                  placeholder="Contoh: Gampong ..."
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Dinas / OPD
                <input
                  name="opd"
                  className={inputClass}
                  placeholder="Contoh: Dinas Lingkungan Hidup"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Nomor register
                <input
                  name="register"
                  className={inputClass}
                  maxLength={50}
                  placeholder="Contoh: 4"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Denah dan Foto Aset</h2>
            <p className="mt-1 text-sm text-slate-500">
              Denah lokasi wajib diupload. Foto tambahan dapat dipilih lebih
              dari satu dan akan disimpan sebagai dokumen aset.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#B8CDE0] bg-[#F4F8FC] p-8 text-center text-sm text-[#315F86] transition hover:border-[#315F86] hover:bg-[#E7EFF8]">
                <span className="font-semibold">Upload denah lokasi *</span>
                <span className="mt-1 block text-xs text-slate-500">
                  JPG, PNG, atau WEBP — maksimal 5 MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!denahPhoto}
                  onChange={handleDenahChange}
                  className="sr-only"
                />
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 transition hover:border-[#315F86] hover:bg-[#F4F8FC]">
                <span className="font-semibold">Tambah foto lainnya</span>
                <span className="mt-1 block text-xs text-slate-500">
                  Bisa memilih beberapa foto sekaligus
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleAdditionalPhotosChange}
                  className="sr-only"
                />
              </label>
            </div>

            {denahPhoto && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <img
                  src={denahPhoto.preview}
                  alt="Pratinjau denah lokasi"
                  className="h-20 w-28 rounded object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {denahPhoto.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Denah lokasi siap diunggah
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDenahPhoto(null)}
                  className="ml-auto text-sm text-red-600"
                >
                  Hapus
                </button>
              </div>
            )}

            {additionalPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {additionalPhotos.map((photo, index) => (
                  <div
                    key={`${photo.file.name}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={photo.preview}
                      alt={`Foto tambahan ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalPhoto(index)}
                      className="absolute right-1 top-1 rounded-full bg-red-600 px-1.5 text-sm text-white"
                      aria-label={`Hapus foto tambahan ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Data Tanah dan Legalitas
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">
                Luas (m²) <span className="font-normal text-slate-400">(opsional)</span>
                <input
                  name="luas"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Tanggal perolehan
                <input name="tanggal" type="date" className={inputClass} />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status hak
                <select name="hak" className={inputClass} defaultValue="Hak Pakai">
                  <option>Hak Pakai</option>
                  <option>Hak Milik</option>
                  <option>Hak Pengelolaan</option>
                  <option>HGB</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Nomor sertifikat
                <input
                  name="no_sertifikat"
                  className={inputClass}
                  placeholder="Kosongkan bila belum ada"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status sertifikat
                <select
                  name="status_sertifikat"
                  className={inputClass}
                  defaultValue="Keterangan Lainnya"
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
                  className={inputClass}
                  placeholder="Contoh: Kantor pemerintahan"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Asal usul
                <select
                  name="asal_usul"
                  className={inputClass}
                  defaultValue="Pembelian"
                >
                  <option>Pembelian</option>
                  <option>Hibah</option>
                  <option>Penyerahan</option>
                  <option>Lainnya</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Lokasi Peta dan Nilai
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">
                Latitude
                <input
                  name="latitude"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  className={inputClass}
                  placeholder="5.18000"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Longitude
                <input
                  name="longitude"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  className={inputClass}
                  placeholder="97.14000"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Nilai perolehan
                <input
                  name="nilai"
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  placeholder="Rp"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Keterangan
              <textarea
                name="keterangan"
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
          </section>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSaving}
              className="ui-button-secondary font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isReadingPhotos}
              className="ui-button-primary font-medium"
            >
              {isReadingPhotos
                ? "Memproses foto..."
                : isSaving
                  ? "Menyimpan..."
                  : "Simpan Aset"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
