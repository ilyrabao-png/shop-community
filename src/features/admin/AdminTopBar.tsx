"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import {
  adminListUsers,
  setAdminOverrideUserId,
  getAdminOverrideUserId,
} from "@/services/api";

export function AdminTopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
        setSwitchOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function handleLogout() {
    setAdminOverrideUserId(null);
    logout();
    router.push("/auth/login");
  }

  function handleSwitchUser(targetId: string) {
    setAdminOverrideUserId(targetId as import("@/types/models").UserId);
    setSwitchOpen(false);
    router.refresh();
    window.location.reload();
  }

  function clearOverride() {
    setAdminOverrideUserId(null);
    setSwitchOpen(false);
    router.refresh();
    window.location.reload();
  }

  const overrideId = typeof window !== "undefined" ? getAdminOverrideUserId() : null;
  const allUsers = typeof window !== "undefined" ? adminListUsers({}) : [];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-green-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <input
          type="search"
          placeholder="Tìm kiếm..."
          className="w-64 rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
        />
      </div>
      <div className="relative flex items-center gap-4" ref={menuRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSwitchOpen((o) => !o)}
            className="rounded-lg border border-green-200 px-3 py-1.5 text-sm text-green-800 hover:bg-green-50"
          >
            {overrideId ? "Đang xem với tài khoản khác" : "Chuyển user (dev)"}
          </button>
          {switchOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-green-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={clearOverride}
                className="block w-full px-4 py-2 text-left text-sm text-green-900 hover:bg-green-50"
              >
                Xóa override (hiển thị đúng session)
              </button>
              {allUsers.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSwitchUser(u.id)}
                  className="block w-full px-4 py-2 text-left text-sm text-green-900 hover:bg-green-50"
                >
                  {u.displayName} ({u.email})
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-700/40"
        >
          <UserAvatar user={user ?? undefined} size="sm" clickable={false} />
          <span className="text-sm font-medium text-green-900">
            {user?.displayName ?? "Admin"}
          </span>
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-green-200 bg-white py-1 shadow-lg">
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm text-green-900 hover:bg-green-50"
            >
              Hồ sơ
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
    </header>
  );
}
