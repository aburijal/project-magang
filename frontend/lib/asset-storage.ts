import { Asset } from "@/types/asset";
import { dummyAssets } from "@/data/dummy-assets";
import { deleteDocumentsByAssetId, loadDocuments, saveDocuments } from "@/lib/document-storage";

const STORAGE_KEY = "lhokseumawe-assets";

function normalizeAsset(asset: Asset): Asset {
  const legacyStatus = String((asset as Asset & { status_sertifikat?: unknown }).status_sertifikat ?? "");
  return {
    ...asset,
    status_sertifikat: legacyStatus === "Dalam Proses"
      ? "Keterangan Lainnya"
      : legacyStatus as Asset["status_sertifikat"],
  };
}

export function loadAssets(): Asset[] {
  if (typeof window === "undefined") return dummyAssets;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyAssets));
    return dummyAssets;
  }

  try {
    const assets = (JSON.parse(stored) as Asset[]).map(normalizeAsset);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    return assets;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return dummyAssets;
  }
}

export function saveAssets(assets: Asset[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  window.dispatchEvent(new Event("assets-updated"));
}

export function addAsset(asset: Asset) {
  saveAssets([...loadAssets(), asset]);
}

export function updateAsset(id: number, updates: Partial<Asset>) {
  saveAssets(loadAssets().map((asset) => (
    asset.id === id ? { ...asset, ...updates } : asset
  )));
}

export function getAsset(id: number) {
  return loadAssets().find((asset) => asset.id === id);
}

export function deleteAsset(id: number) {
  saveAssets(loadAssets().filter((asset) => asset.id !== id));
}

export function deleteAssetWithDocuments(id: number) {
  const assets = loadAssets();
  const asset = assets.find((item) => item.id === id);
  if (!asset) throw new Error("Aset yang akan dihapus tidak ditemukan.");

  const documents = loadDocuments();
  const relatedDocuments = documents.filter((document) => document.assetId === id);

  try {
    deleteDocumentsByAssetId(id);
    saveAssets(assets.filter((item) => item.id !== id));
  } catch (error) {
    try {
      saveDocuments(documents);
      saveAssets(assets);
    } catch {
      throw new Error("Penghapusan gagal dan pemulihan data juga gagal. Periksa penyimpanan aplikasi.");
    }
    throw error instanceof Error
      ? error
      : new Error("Aset dan dokumen terkait tidak dapat dihapus.");
  }

  return relatedDocuments.length;
}
