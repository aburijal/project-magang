export interface AssetDocument {
  id: string;
  assetId: number;
  title: string;
  type: string;
  description: string;
  photos: string[];
  createdAt: string;
}

export const DOCUMENTS_STORAGE_KEY = "lhokseumawe-asset-documents";

export function loadDocuments(): AssetDocument[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(DOCUMENTS_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as AssetDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
    return [];
  }
}

export function saveDocuments(documents: AssetDocument[]) {
  window.localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
  window.dispatchEvent(new Event("documents-updated"));
}

export function addDocument(document: AssetDocument) {
  saveDocuments([document, ...loadDocuments()]);
}

export function deleteDocumentsByAssetId(assetId: number): AssetDocument[] {
  const documents = loadDocuments();
  const remainingDocuments = documents.filter((document) => document.assetId !== assetId);
  saveDocuments(remainingDocuments);
  return documents.filter((document) => document.assetId === assetId);
}
