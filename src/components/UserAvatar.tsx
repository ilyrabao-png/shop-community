"use client";

import Link from "next/link";
import type { UserId } from "@/types/models";
import { getUserById } from "@/services/api";

type SizeVariant = "sm" | "md" | "lg";

const sizeClasses: Record<SizeVariant, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-16 w-16 text-2xl",
};

const sizePx: Record<SizeVariant, number> = {
  sm: 32,
  md: 40,
  lg: 64,
};

type UserAvatarProps = {
  userId?: UserId;
  user?: { id: UserId; displayName: string; avatarUrl?: string | null };
  size?: SizeVariant;
  clickable?: boolean;
  className?: string;
};

function getDisplayName(
  userId: UserId | undefined,
  user: { displayName: string } | undefined
): string {
  if (user?.displayName) return user.displayName;
  if (userId) {
    const u = getUserById(userId);
    return u?.displayName ?? "?";
  }
  return "?";
}

function getAvatarUrl(
  userId: UserId | undefined,
  user: { avatarUrl?: string | null } | undefined
): string | undefined {
  if (user && "avatarUrl" in user && user.avatarUrl) return user.avatarUrl;
  if (userId) {
    const u = getUserById(userId);
    return u?.avatarUrl ?? undefined;
  }
  return undefined;
}

export function UserAvatar({
  userId,
  user,
  size = "md",
  clickable = true,
  className = "",
}: UserAvatarProps) {
  const id = user?.id ?? userId;
  const displayName = getDisplayName(id, user);
  const avatarUrl = getAvatarUrl(id, user);
  const initials = displayName.charAt(0).toUpperCase();

  const sizeClass = sizeClasses[size];
  const layoutClasses = `flex shrink-0 items-center justify-center rounded-full ${sizeClass}`;

  const px = sizePx[size];
  const avatarEl = avatarUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={avatarUrl}
      alt=""
      width={px}
      height={px}
      className={`${layoutClasses} object-cover ${className}`}
    />
  ) : (
    <span
      className={`${layoutClasses} ${className || "bg-green-100 font-medium text-green-800"}`}
      aria-hidden
    >
      {initials}
    </span>
  );

  if (clickable && id) {
    return (
      <Link
        href={`/u/${id}`}
        className="block shrink-0 rounded-full ring-2 ring-transparent transition hover:ring-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label={`Xem hồ sơ của ${displayName}`}
      >
        {avatarEl}
      </Link>
    );
  }

  return avatarEl;
}
