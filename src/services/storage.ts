/**
 * Versioned localStorage persistence (v2).
 * Single source of truth for users list, session, per-user profile.
 * Safe JSON parse - never throws.
 * Migrates from legacy keys on first load.
 */

import type { AuthUser } from "@/types/models";

// =============================================================================
// v2 keys (versioned, namespaced)
// =============================================================================

export const BMARKET_V2_USERS = "bmarket:v2:users";
export const BMARKET_V2_SESSION = "bmarket:v2:session";
export const BMARKET_V2_CURRENT_USER_ID = "bmarket:v2:currentUserId";
export const BMARKET_V2_ADMIN_OVERRIDE = "bmarket:v2:adminOverrideUserId";

/** Legacy keys to migrate from */
const LEGACY_KEYS = {
  users: ["bmarket_users", "users"] as const,
  session: ["bmarket_session", "session"] as const,
  currentUserId: ["bmarket:currentUserId"] as const,
};

/** Per-user profile key (unchanged, no migration needed for hundreds of keys) */
export const USER_KEY = (id: string): string => `bmarket:user:${id}`;

/** @deprecated Use BMARKET_V2_CURRENT_USER_ID. Kept for compatibility. */
export const CURRENT_USER_KEY = BMARKET_V2_CURRENT_USER_ID;

/** Full user record for storage (matches StoredUser in api) */
export interface StorageUserRecord {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  password: string;
  status?: string;
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/** Stored user profile - AuthUser shape plus optional profile fields */
export type StoredUserProfile = AuthUser & {
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: { facebook?: string; zalo?: string; website?: string };
};

// =============================================================================
// Helpers
// =============================================================================

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readFirstOf(keys: readonly string[]): string | null {
  if (typeof window === "undefined") return null;
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

let migrated = false;

export function migrateStorageIfNeeded(): void {
  if (typeof window === "undefined" || migrated) return;
  migrated = true;
  try {
    if (!localStorage.getItem(BMARKET_V2_USERS)) {
      const raw = readFirstOf(LEGACY_KEYS.users);
      if (raw) {
        const parsed = safeParse<StorageUserRecord[]>(raw, []);
        if (Array.isArray(parsed) && parsed.length >= 0) {
          localStorage.setItem(BMARKET_V2_USERS, JSON.stringify(parsed));
        }
      }
    }
    if (!localStorage.getItem(BMARKET_V2_SESSION)) {
      const raw = readFirstOf(LEGACY_KEYS.session);
      if (raw) {
        const parsed = safeParse<AuthUser | null>(raw, null);
        if (parsed && typeof parsed === "object" && parsed.id) {
          localStorage.setItem(BMARKET_V2_SESSION, JSON.stringify(parsed));
        }
      }
    }
    if (!localStorage.getItem(BMARKET_V2_CURRENT_USER_ID)) {
      const raw = readFirstOf(LEGACY_KEYS.currentUserId);
      if (raw && typeof raw === "string" && raw.length > 0) {
        localStorage.setItem(BMARKET_V2_CURRENT_USER_ID, raw);
      }
    }
  } catch {
    // ignore
  }
}

// =============================================================================
// Users list
// =============================================================================

export function getUsers(): StorageUserRecord[] {
  if (typeof window === "undefined") return [];
  migrateStorageIfNeeded();
  try {
    const raw = localStorage.getItem(BMARKET_V2_USERS);
    const parsed = raw ? safeParse<StorageUserRecord[]>(raw, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StorageUserRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BMARKET_V2_USERS, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function upsertUser(user: StorageUserRecord): void {
  const list = getUsers();
  const byId = list.find((u) => u.id === user.id);
  const byEmail = list.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  const existing = byId ?? byEmail;
  const next: StorageUserRecord[] = existing
    ? list.map((u) =>
        u.id === existing.id || u.email.toLowerCase() === user.email.toLowerCase()
          ? { ...u, ...user, id: u.id, email: u.email.toLowerCase() }
          : u
      )
    : [...list, { ...user, email: user.email.toLowerCase() }];
  saveUsers(next);
}

// =============================================================================
// Session
// =============================================================================

export type Session = AuthUser | null;

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  migrateStorageIfNeeded();
  try {
    const raw = localStorage.getItem(BMARKET_V2_SESSION);
    if (!raw) return null;
    const parsed = safeParse<AuthUser | null>(raw, null);
    return parsed && typeof parsed === "object" && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(BMARKET_V2_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(BMARKET_V2_SESSION);
    }
  } catch {
    // ignore
  }
}

// =============================================================================
// Current user ID (for dev / persistence)
// =============================================================================

export function loadCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  migrateStorageIfNeeded();
  try {
    return localStorage.getItem(BMARKET_V2_CURRENT_USER_ID);
  } catch {
    return null;
  }
}

export function saveCurrentUserId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BMARKET_V2_CURRENT_USER_ID, id);
  } catch {
    // ignore
  }
}

export function clearCurrentUserId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BMARKET_V2_CURRENT_USER_ID);
  } catch {
    // ignore
  }
}

// =============================================================================
// Per-user profile (avatar, bio, etc.)
// =============================================================================

export function loadUser(id: string): StoredUserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY(id));
    if (!raw) return null;
    const parsed = safeParse<StoredUserProfile | null>(raw, null);
    return parsed;
  } catch {
    return null;
  }
}

export function saveUser(user: StoredUserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY(user.id), JSON.stringify(user));
    window.dispatchEvent(
      new CustomEvent("bmarket:user-updated", { detail: { userId: user.id } })
    );
  } catch {
    // ignore
  }
}

export function clearUser(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY(id));
  } catch {
    // ignore
  }
}
