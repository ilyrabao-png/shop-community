/**
 * Client-side session storage.
 * Uses storage.ts v2 keys. Re-exports for backward compatibility.
 */

import type { AuthUser } from "@/types/models";
import { getSession as storageGetSession, saveSession as storageSaveSession } from "@/services/storage";

export function getSession(): AuthUser | null {
  return storageGetSession();
}

export function setSession(user: AuthUser | null): void {
  storageSaveSession(user);
}
