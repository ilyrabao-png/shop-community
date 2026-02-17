"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import { isAdmin } from "@/services/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login?next=/admin");
      return;
    }
    if (!isAdmin(user.id)) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-green-900/60">Đang chuyển hướng...</p>
      </div>
    );
  }

  if (!isAdmin(user.id)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold text-green-900">Không có quyền truy cập</h1>
        <p className="text-green-900/70">Bạn không có quyền admin.</p>
        <Link href="/" className="text-green-700 hover:underline">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
