"use client";

import Link from "next/link";
import type { Notification } from "@/types/models";
import { UserAvatar } from "@/components/UserAvatar";

export function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const isUnread = !notification.readAt;
  const href = notification.postId
    ? `/feed/${notification.postId}`
    : notification.productId
      ? `/shop/${notification.productId}`
      : "#";

  return (
    <div
      className={`rounded-lg border p-4 transition hover:bg-green-50/50 ${
        isUnread
          ? "border-green-300 bg-green-50/80"
          : "border-green-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <UserAvatar userId={notification.actorId} size="md" />
        </div>
        <Link
          href={href}
          onClick={onMarkRead}
          className="min-w-0 flex-1"
        >
          <p className="font-medium text-green-900">{notification.title}</p>
          <p className="mt-0.5 text-sm text-green-900/80">{notification.body}</p>
          <p className="mt-1 text-xs text-green-900/50">
            {new Date(notification.createdAt).toLocaleString("vi-VN")}
          </p>
        </Link>
      </div>
    </div>
  );
}
