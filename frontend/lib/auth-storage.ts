
export type UserRole = "admin" | "user";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const AUTH_STORAGE_KEY = "project-magang-auth";

export function loadAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as AuthSession;

    if (
      !session.token ||
      !session.user?.email ||
      !session.user?.name ||
      !["admin", "user"].includes(session.user?.role)
    ) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
