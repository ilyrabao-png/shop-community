"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/cart";
import { useNotifications } from "@/store/notifications";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/feed", label: "Feed" },
] as const;

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100/80 bg-amber-50/95 backdrop-blur supports-[backdrop-filter]:bg-amber-50/80">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
        aria-label="Main"
      >
        <Logo size="sm" />

        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2 ${
                  isActive
                    ? "bg-green-800/10 text-green-800"
                    : "text-green-900/80 hover:bg-green-800/5 hover:text-green-900"
                }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="ml-2 flex items-center gap-2 sm:ml-4">
            <Link
              href="/notifications"
              aria-label={`Thông báo (${unreadCount} chưa đọc)`}
              className="relative rounded p-2 text-green-900/80 hover:bg-green-800/5 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
            >
              <BellIcon />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-700 px-1 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/cart"
              aria-label={`Giỏ hàng (${totalCount} sản phẩm)`}
              className="relative rounded p-2 text-green-900/80 hover:bg-green-800/5 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
            >
              <CartIcon />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-700 px-1 text-[10px] font-medium text-white">
                {totalCount}
              </span>
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="Tài khoản"
                >
                  <UserAvatar user={user} size="sm" clickable={false} className="bg-green-700 text-white" />
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-green-200 bg-white py-1 shadow-lg">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-green-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-green-900 hover:bg-green-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    ) : null}
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-green-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Đơn hàng
                    </Link>
                    <Link
                      href="/sell"
                      className="block px-4 py-2 text-sm text-green-900 hover:bg-green-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Đăng bán
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-green-900 hover:bg-green-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
