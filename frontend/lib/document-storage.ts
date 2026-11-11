import { deletePhotos, isPhotoReference, storePhotos } from "@/lib/photo-storage";

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

export function createDocumentId(): string {
  return `document-${crypto.randomUUID()}`;
}

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

export async function saveDocumentWithPhotos(document: AssetDocument): Promise<AssetDocument> {
  const references = await storePhotos(document.photos);
  const storedDocument = { ...document, photos: references };
  const documents = loadDocuments();
  const nextDocuments = documents.some((item) => item.id === document.id)
    ? documents.map((item) => item.id === document.id ? storedDocument : item)
    : [storedDocument, ...documents];
  try {
    saveDocuments(nextDocuments);
  } catch (error) {
    await deletePhotos(references);
    throw error;
  }
  return storedDocument;
}

export async function addDocument(document: AssetDocument): Promise<AssetDocument> {
  return saveDocumentWithPhotos(document);
}

export async function migrateLegacyDocuments(): Promise<void> {
  const documents = loadDocuments();
  const legacyDocuments = documents.filter((document) => document.photos.some((photo) => !isPhotoReference(photo)));
  if (!legacyDocuments.length) return;

  const migrated: AssetDocument[] = [];
  const createdReferences: string[] = [];
  try {
    for (const document of documents) {
      if (!document.photos.some((photo) => !isPhotoReference(photo))) {
        migrated.push(document);
        continue;
      }
      const references = await storePhotos(document.photos);
      createdReferences.push(...references.filter((reference) => !document.photos.includes(reference)));
      migrated.push({ ...document, photos: references });
    }
    saveDocuments(migrated);
  } catch (error) {
    await deletePhotos(createdReferences);
    throw error;
  }
}

export function deleteDocumentsByAssetId(assetId: number): AssetDocument[] {
  const documents = loadDocuments();
  const remainingDocuments = documents.filter((document) => document.assetId !== assetId);
  saveDocuments(remainingDocuments);
  return documents.filter((document) => document.assetId === assetId);
}
