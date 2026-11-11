const DATABASE_NAME = "lhokseumawe-asset-photos";
const DATABASE_VERSION = 1;
const STORE_NAME = "photos";
const PHOTO_PREFIX = "photo:";

interface StoredPhoto {
  id: string;
  blob: Blob;
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB tidak tersedia di browser ini."));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Database foto tidak dapat dibuka."));
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function photoToBlob(photo: string): Promise<Blob> {
  if (!photo.startsWith("data:")) {
    const response = await fetch(photo);
    if (!response.ok) throw new Error("Foto tidak dapat dibaca.");
    return response.blob();
  }

  const dataUrl = photo;
  const [header, encoded] = dataUrl.split(",", 2);
  if (!header?.startsWith("data:") || encoded === undefined) {
    throw new Error("Format foto tidak valid.");
  }

  const mimeType = header.match(/^data:([^;]+);base64$/)?.[1];
  if (!mimeType) throw new Error("Format foto tidak valid.");

  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error ?? new Error("Operasi foto gagal."));
    request.onsuccess = () => resolve(request.result);
  });
}

export function isPhotoReference(value: string): boolean {
  return value.startsWith(PHOTO_PREFIX);
}

export async function storePhoto(photo: string): Promise<string> {
  const db = await openDatabase();
  const id = `${PHOTO_PREFIX}${crypto.randomUUID()}`;
  const transaction = db.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).put({ id, blob: await photoToBlob(photo) } satisfies StoredPhoto);

  await new Promise<void>((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error ?? new Error("Foto tidak dapat disimpan."));
    transaction.oncomplete = () => resolve();
  });
  db.close();
  return id;
}

export async function storePhotos(photos: string[]): Promise<string[]> {
  const stored: string[] = [];
  const created: string[] = [];
  try {
    for (const photo of photos) {
      if (isPhotoReference(photo)) {
        stored.push(photo);
      } else {
        const reference = await storePhoto(photo);
        stored.push(reference);
        created.push(reference);
      }
    }
    return stored;
  } catch (error) {
    await deletePhotos(created);
    throw error;
  }
}

export async function resolvePhoto(photo: string): Promise<string> {
  if (!isPhotoReference(photo)) return photo;
  const db = await openDatabase();
  const stored = await requestResult(db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(photo) as IDBRequest<StoredPhoto | undefined>);
  db.close();
  if (!stored) throw new Error("Foto tidak ditemukan di penyimpanan browser.");
  return URL.createObjectURL(stored.blob);
}

export async function resolvePhotos(photos: string[]): Promise<string[]> {
  return Promise.all(photos.map(resolvePhoto));
}

export async function deletePhotos(photos: string[]): Promise<void> {
  const references = photos.filter(isPhotoReference);
  if (!references.length) return;
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  references.forEach((reference) => transaction.objectStore(STORE_NAME).delete(reference));
  await new Promise<void>((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error ?? new Error("Foto tidak dapat dihapus."));
    transaction.oncomplete = () => resolve();
  });
  db.close();
}

export async function photoForFingerprint(photo: string): Promise<string> {
  return resolvePhoto(photo);
}
