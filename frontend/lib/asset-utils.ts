import { Asset } from "@/types/asset";

export type AssetStatus = "Bersertifikat" | "Belum Bersertifikat";

export function getAssetStatus(asset: Asset): AssetStatus {
  return asset.no_sertifikat !== "-" && asset.no_sertifikat !== ""
    ? "Bersertifikat"
    : "Belum Bersertifikat";
}

export function formatArea(area: number | null): string {
  return area === null ? "-" : `${area.toLocaleString("id-ID")} m²`;
}

export function formatCurrency(value: number | null): string {
  return value === null
    ? "-"
    : `Rp ${value.toLocaleString("id-ID")}`;
}

export function getAssetSummary(assets: Asset[]) {
  const totalArea = assets.reduce((total, asset) => total + (asset.luas_m2 ?? 0), 0);
  const certified = assets.filter((asset) => getAssetStatus(asset) === "Bersertifikat").length;

  return {
    total: assets.length,
    totalArea,
    certified,
    uncertified: assets.length - certified,
  };
}

export function getDistrictSummary(assets: Asset[]) {
  const groups = new Map<string, number>();

  for (const asset of assets) {
    groups.set(
      asset.lokasi_aset,
      (groups.get(asset.lokasi_aset) ?? 0) + (asset.luas_m2 ?? 0),
    );
  }

  const largest = Math.max(...groups.values(), 1);
  return Array.from(groups, ([name, area]) => ({
    name: name.replace(/^Kecamatan\s+/i, ""),
    area,
    percentage: Math.round((area / largest) * 100),
  })).sort((a, b) => b.area - a.area);
}
