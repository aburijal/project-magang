export async function photoFingerprint(photo: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const response = await fetch(photo);
    const bytes = await response.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return photo;
}

export async function uniquePhotos(photos: string[]): Promise<string[]> {
  const fingerprints = new Set<string>();
  const unique: string[] = [];

  for (const photo of photos) {
    const fingerprint = await photoFingerprint(photo);
    if (fingerprints.has(fingerprint)) continue;
    fingerprints.add(fingerprint);
    unique.push(photo);
  }

  return unique;
}
