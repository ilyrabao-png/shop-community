"use client";

import type { AuthUser } from "@/types/models";
import {
  registerUser as apiRegister,
  loginUser as apiLogin,
  updateUserProfile,
  updateUserAvatar,
} from "@/services/api";
import { getSession, setSession } from "@/features/auth/session";
import {
  loadUser as storageLoadUser,
  saveUser as storageSaveUser,
  saveCurrentUserId,
  clearCurrentUserId,
} from "@/services/storage";
import type { SocialLinks } from "@/types/models";

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((cb) => cb());
}

export type ProfileUpdates = {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: SocialLinks;
};

export type AuthStore = {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  logout: () => void;
  register: (email: string, password: string, displayName: string) => Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }>;
  updateProfile: (updates: ProfileUpdates) => void;
  updateAvatar: (dataUrl: string | null) => void;
  hydrate: () => void;
};

function resolveCurrentUser(): AuthUser | null {
  const session = getSession();
  if (!session) return null;
  // Prefer storage (has avatar) over session
  const stored = storageLoadUser(session.id);
  return stored ?? session;
}

export function createAuthStore(): AuthStore {
  let currentUser: AuthUser | null =
    typeof window !== "undefined" ? resolveCurrentUser() : null;

  return {
    get currentUser() {
      return currentUser;
    },

    async login(email: string, password: string) {
      const result = apiLogin(email, password);
      if (!result.ok) return result;
      currentUser = result.user;
      setSession(result.user);
      storageSaveUser(result.user);
      saveCurrentUserId(result.user.id);
      notify();
      return result;
    },

    logout() {
      currentUser = null;
      setSession(null);
      clearCurrentUserId();
      notify();
    },

    async register(email: string, password: string, displayName: string) {
      const result = apiRegister(email, password, displayName);
      if (!result.ok) return result;
      currentUser = result.user;
      setSession(result.user);
      storageSaveUser(result.user);
      saveCurrentUserId(result.user.id);
      notify();
      return result;
    },

    updateProfile(updates: ProfileUpdates) {
      if (!currentUser) return;
      const updated = updateUserProfile(currentUser.id, updates);
      if (updated) {
        currentUser = updated;
        setSession(updated);
        notify();
      }
    },

    updateAvatar(dataUrl: string | null) {
      if (!currentUser) return;
      const updated = updateUserAvatar(currentUser.id, dataUrl);
      if (updated) {
        currentUser = updated;
        setSession(updated);
        notify();
      }
    },

    hydrate() {
      currentUser = resolveCurrentUser();
      notify();
    },
  };
}

export const authStore = createAuthStore();

export function subscribeToAuth(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
