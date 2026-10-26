
import type { Asset } from "@/types/asset";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type ApiRelation = {
  id?: number;
  nama?: string | null;
  kode?: string | null;
  kecamatan?: string | null;
  gampong?: string | null;
  alamat?: string | null;
};

type ApiCertificate = {
  certificate_number?: string | null;
  certificate_date?: string | null;
  status?: string | null;
};

type ApiCoordinate = {
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type ApiLandAsset = {
  id: number;
  name?: string | null;
  register_number?: string | null;
  area?: number | string | null;
  acquisition_year?: number | null;
  acquisition_date?: string | null;
  usage?: string | null;
  price?: number | string | null;
  description?: string | null;
  field_condition?: string | null;

  opd?: ApiRelation | null;
  location?: ApiRelation | null;

  // Laravel umumnya menserialisasi nama relasi menjadi snake_case.
  asset_category?: ApiRelation | null;
  assetCategory?: ApiRelation | null;
  land_right?: ApiRelation | null;
  landRight?: ApiRelation | null;
  acquisition_source?: ApiRelation | null;
  acquisitionSource?: ApiRelation | null;

  certificates?: ApiCertificate[];
  coordinates?: ApiCoordinate[];
};

function toNumberOrNull(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapCertificateStatus(
  status?: string | null,
): Asset["status_sertifikat"] {
  const value = status?.trim().toLowerCase().replaceAll("_", " ");

  if (value === "bersertifikat" || value === "terbit") {
    return "Bersertifikat";
  }

  if (
    value === "belum bersertifikat" ||
    value === "belum terbit"
  ) {
    return "Belum Bersertifikat";
  }

  return "Keterangan Lainnya";
}

function mapApiAsset(item: ApiLandAsset, index: number): Asset {
  const certificate = item.certificates?.[0];
  const coordinate = item.coordinates?.[0];

  const location = item.location;
  const category = item.asset_category ?? item.assetCategory;
  const landRight = item.land_right ?? item.landRight;
  const acquisitionSource =
    item.acquisition_source ?? item.acquisitionSource;

  const district = location?.kecamatan ?? "";
  const village = location?.gampong ?? "";
  const address = location?.alamat ?? "";

  const certificateNumber =
    certificate?.certificate_number?.trim() || "-";

  const certificateDate =
    certificate?.certificate_date?.slice(0, 10) || "-";

  const acquisitionDate =
    item.acquisition_date?.slice(0, 10) ??
    (item.acquisition_year ? String(item.acquisition_year) : "-");

  return {
    id: item.id,
    no: index + 1,
    no_register: item.register_number ?? "-",

    nama_barang_aset:
      item.name?.trim() ||
      item.register_number ||
      category?.nama ||
      `Aset ${item.id}`,

    dinas_opd: item.opd?.nama ?? "-",
    lokasi_aset: district ? `Kecamatan ${district}` : "-",
    alamat: [village, address]
      .filter((value, index, values) => value && values.indexOf(value) === index)
      .join(", ") || "-",

    luas_m2: toNumberOrNull(item.area),
    tanggal_perolehan: acquisitionDate,

    hak: landRight?.nama ?? "-",
    tanggal_sertifikat: certificateDate,
    no_sertifikat: certificateNumber,

    status_sertifikat: certificate
      ? mapCertificateStatus(certificate.status)
      : "Belum Bersertifikat",

    penggunaan: item.usage ?? "-",
    asal_usul: acquisitionSource?.nama ?? "-",
    nilai_perolehan: toNumberOrNull(item.price),
    keterangan: item.description ?? "-",
    keterangan_di_lapangan: item.field_condition ?? "",

    koordinat_x: toNumberOrNull(coordinate?.latitude),
    koordinat_y: toNumberOrNull(coordinate?.longitude),
  };
}

export async function fetchAssetsFromApi(): Promise<Asset[]> {
  const response = await fetch(`${API_URL}/land-assets`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gagal mengambil data aset dari API (HTTP ${response.status}).`,
    );
  }

  const result: { data: ApiLandAsset[] } = await response.json();

  return result.data.map(mapApiAsset);
}
