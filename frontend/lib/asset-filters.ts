import { Asset } from "@/types/asset";

export const assetStatusOptions = [
  "Bersertifikat",
  "Belum Bersertifikat",
  "Keterangan Lainnya",
] as const;

export const acquisitionSourceOptions = ["Hibah", "Pembelian"] as const;

export type AssetStatusFilter = "Semua Status" | typeof assetStatusOptions[number];
export type AcquisitionSourceFilter = "Semua Asal Usul" | typeof acquisitionSourceOptions[number];

export function normalizeFilterValue(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("id-ID");
}

export function matchesAcquisitionSource(asset: Asset, filter: AcquisitionSourceFilter): boolean {
  return filter === "Semua Asal Usul"
    || normalizeFilterValue(asset.asal_usul) === normalizeFilterValue(filter);
}
