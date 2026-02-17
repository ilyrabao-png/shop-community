"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserId } from "@/types/models";
import { getUnreadNotificationCount } from "@/services/api";
import { useAuth } from "./useAuth";

type NotificationsContextValue = {
  unreadCount: number;
  refresh: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function NotificationsProviderInner({
  children,
  userId,
}: {
  children: ReactNode;
  userId: UserId | null;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    getUnreadNotificationCount(userId).then(setUnreadCount);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: NotificationsContextValue = {
    unreadCount,
    refresh,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <NotificationsProviderInner userId={user?.id ?? null}>
      {children}
    </NotificationsProviderInner>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      refresh: () => {},
    };
  }
  return ctx;
}
