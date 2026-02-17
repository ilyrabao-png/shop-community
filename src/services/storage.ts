/**
 * Per-user localStorage persistence.
 * Single source of truth for user profile (avatar, bio, etc).
 * Safe JSON parse - never throws.
 */

import type { AuthUser } from "@/types/models";

export const USER_KEY = (id: string): string => `bmarket:user:${id}`;
export const CURRENT_USER_KEY = "bmarket:currentUserId";

/** Stored user profile - AuthUser shape plus optional profile fields */
export type StoredUserProfile = AuthUser & {
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: { facebook?: string; zalo?: string; website?: string };
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

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

export function loadCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

export function saveCurrentUserId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } catch {
    // ignore
  }
}

export function clearCurrentUserId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
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
