"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import type { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
  /** Redirect to this path when unauthenticated */
  redirectTo?: string;
  /** If true, only show children when logged in (no redirect, just hide) */
  hideOnly?: boolean;
};

/**
 * Protects wrapped content: redirects to login when user is not logged in.
 * Use for pages/actions that require authentication.
 */
export function AuthGuard({
  children,
  redirectTo = "/auth/login",
  hideOnly = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (user === undefined) return; // still hydrating
    if (!user) {
      if (hideOnly) return;
      const next = encodeURIComponent(pathname ?? "/");
      router.replace(`${redirectTo}?next=${next}`);
    }
  }, [user, router, redirectTo, pathname, hideOnly]);

  if (!user && hideOnly) return null;
  if (!user) return null; // will redirect

  return <>{children}</>;
}
