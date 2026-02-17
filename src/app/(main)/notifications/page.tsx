"use client";

/**
 * TEST: /notifications
 * - Create post with currentUser, like with another user => notification appears
 * - Comment on post => notification appears
 * - Review product owned by currentUser => notification appears
 * - Unread badge in header increments; "Mark all read" clears badge
 * - Click notification => navigates to post/product, marks read
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/api";
import { useNotifications } from "@/store/notifications";
import type { Notification } from "@/types/models";
import { Button } from "@/components/ui";
import { NotificationItem } from "@/components/notifications/NotificationItem";

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login?next=/notifications");
      return;
    }
    listNotifications(user.id)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [user, router]);

  async function handleMarkRead(notification: Notification) {
    if (!user) return;
    await markNotificationRead(notification.id, user.id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    );
    refresh();
  }

  async function handleMarkAllRead() {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
    refresh();
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-green-900">Thông báo</h1>
        <p className="mt-4 text-green-900/60">Đang tải…</p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-900">Thông báo</h1>
        {hasUnread ? (
          <Button
            variant="secondary"
            onClick={handleMarkAllRead}
            className="text-green-700"
          >
            Đánh dấu tất cả đã đọc
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50/50 px-4 py-6 text-center text-sm text-green-900/70">
          Chưa có thông báo nào.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {notifications.map((n) => (
            <li key={n.id}>
              <NotificationItem
                notification={n}
                onMarkRead={() => handleMarkRead(n)}
              />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-green-700 hover:underline"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
