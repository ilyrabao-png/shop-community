"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGuard } from "@/features/admin/AdminGuard";
import { AdminTopBar } from "@/features/admin/AdminTopBar";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/posts", label: "Bài viết" },
  { href: "/admin/reviews", label: "Đánh giá" },
  { href: "/admin/reports", label: "Báo cáo" },
  { href: "/admin/settings", label: "Cài đặt" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50/90 p-4">
        {children}
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r border-green-200 bg-white">
          <div className="sticky top-0 flex flex-col gap-1 p-3">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-green-900"
            >
              B Market Admin
            </Link>
            <nav className="mt-2 space-y-0.5">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "text-green-900/80 hover:bg-green-50 hover:text-green-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/"
              className="mt-4 rounded-lg px-3 py-2 text-sm text-green-900/70 hover:bg-green-50 hover:text-green-900"
            >
              ← Về trang chủ
            </Link>
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <AdminTopBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
