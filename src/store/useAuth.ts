"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/types/models";
import { authStore, subscribeToAuth } from "./auth";

export function useAuth(): {
  user: AuthUser | null;
  login: typeof authStore.login;
  logout: typeof authStore.logout;
  register: typeof authStore.register;
  updateProfile: typeof authStore.updateProfile;
  updateAvatar: typeof authStore.updateAvatar;
} {
  const [user, setUser] = useState<AuthUser | null>(authStore.currentUser);

  useEffect(() => {
    authStore.hydrate();
    setUser(authStore.currentUser);
    const unsub = subscribeToAuth(() => {
      setUser(authStore.currentUser);
    });
    const onUserUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ userId: string }>).detail;
      if (authStore.currentUser?.id === detail?.userId) {
        authStore.hydrate();
        setUser(authStore.currentUser);
      }
    };
    window.addEventListener("bmarket:user-updated", onUserUpdated);
    return () => {
      unsub();
      window.removeEventListener("bmarket:user-updated", onUserUpdated);
    };
  }, []);

  return {
    user,
    login: authStore.login.bind(authStore),
    logout: authStore.logout.bind(authStore),
    register: authStore.register.bind(authStore),
    updateProfile: authStore.updateProfile.bind(authStore),
    updateAvatar: authStore.updateAvatar.bind(authStore),
  };
}
