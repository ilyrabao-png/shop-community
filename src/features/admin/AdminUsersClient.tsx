"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { Button, Badge, Input } from "@/components/ui";
import { adminListUsers, adminUpdateUser } from "@/services/api";
import type { StoredUser } from "@/services/api";
import type { UserStatus } from "@/types/models";

export function AdminUsersClient() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [adminFilter, setAdminFilter] = useState<boolean | "">("");

  useEffect(() => {
    setUsers(
      adminListUsers({
        q: q || undefined,
        status: statusFilter || undefined,
        isAdmin: adminFilter === "" ? undefined : adminFilter,
      })
    );
  }, [q, statusFilter, adminFilter]);

  function handleToggleAdmin(u: StoredUser) {
    if (!currentUser || currentUser.role !== "admin") return;
    adminUpdateUser(u.id, { role: u.role === "admin" ? "user" : "admin" });
    setUsers(
      adminListUsers({
        q: q || undefined,
        status: statusFilter || undefined,
        isAdmin: adminFilter === "" ? undefined : adminFilter,
      })
    );
  }

  function handleToggleStatus(u: StoredUser) {
    const s = (u.status ?? "active") as UserStatus;
    const next: UserStatus = s === "suspended" ? "active" : "suspended";
    adminUpdateUser(u.id, { status: next });
    setUsers(
      adminListUsers({
        q: q || undefined,
        status: statusFilter || undefined,
        isAdmin: adminFilter === "" ? undefined : adminFilter,
      })
    );
  }

  function handleResetAvatar(u: StoredUser) {
    adminUpdateUser(u.id, { avatarUrl: null });
    setUsers(
      adminListUsers({
        q: q || undefined,
        status: statusFilter || undefined,
        isAdmin: adminFilter === "" ? undefined : adminFilter,
      })
    );
  }

  function handleSoftDelete(u: StoredUser) {
    adminUpdateUser(u.id, { status: "deleted" });
    setUsers(
      adminListUsers({
        q: q || undefined,
        status: statusFilter || undefined,
        isAdmin: adminFilter === "" ? undefined : adminFilter,
      })
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-900">Quản lý người dùng</h1>
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Tìm theo tên, email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-64 border-green-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter((e.target.value || "") as UserStatus | "")}
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="suspended">Đã khóa</option>
          <option value="deleted">Đã xóa</option>
        </select>
        <select
          value={adminFilter === "" ? "" : adminFilter ? "1" : "0"}
          onChange={(e) =>
            setAdminFilter(e.target.value === "" ? "" : e.target.value === "1")
          }
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="1">Admin</option>
          <option value="0">User</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-200 bg-green-50/50">
              <th className="px-4 py-3 text-left font-medium text-green-900">Avatar</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Tên</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Email</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Role</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Ngày tạo</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-green-100">
                <td className="px-4 py-3">
                  <UserAvatar userId={u.id} size="sm" clickable={false} />
                </td>
                <td className="px-4 py-3 font-medium text-green-900">{u.displayName}</td>
                <td className="px-4 py-3 text-green-900/70">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <Badge className="bg-amber-100 text-amber-800">Admin</Badge>
                  ) : (
                    <span className="text-green-900/70">{u.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      (u.status ?? "active") === "active"
                        ? "bg-green-100 text-green-700"
                        : (u.status ?? "active") === "suspended"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                    }
                  >
                    {u.status ?? "active"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-green-900/60">
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/u/${u.id}`}>
                      <Button variant="ghost" className="text-xs">
                        Xem
                      </Button>
                    </Link>
                    {currentUser?.role === "admin" && u.id !== currentUser.id ? (
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => handleToggleAdmin(u)}
                      >
                        {u.role === "admin" ? "Bỏ admin" : "Làm admin"}
                      </Button>
                    ) : null}
                    {(u.status ?? "active") !== "deleted" ? (
                      <>
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => handleToggleStatus(u)}
                        >
                          {(u.status ?? "active") === "suspended" ? "Mở khóa" : "Khóa"}
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => handleResetAvatar(u)}
                        >
                          Xóa avatar
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs text-amber-700"
                          onClick={() => handleSoftDelete(u)}
                        >
                          Xóa
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
