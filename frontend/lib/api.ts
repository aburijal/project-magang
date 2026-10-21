import { loadAuthSession } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type ApiOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const session = loadAuthSession();
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body
        ? String(body.message)
        : `Request API gagal (${response.status}).`;

    throw new Error(message);
  }

  return body as T;
}
