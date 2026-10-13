import { Asset } from "@/types/asset";
import { dummyAssets } from "@/data/dummy-assets";

const STORAGE_KEY = "lhokseumawe-assets";

export function loadAssets(): Asset[] {
  if (typeof window === "undefined") return dummyAssets;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyAssets));
    return dummyAssets;
  }

  try {
    return JSON.parse(stored) as Asset[];
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
