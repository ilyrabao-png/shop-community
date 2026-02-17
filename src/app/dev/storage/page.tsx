"use client";

/**
 * Dev-only: Export/Import users JSON.
 * Protected by NODE_ENV check. Merge on import (do not overwrite existing fields).
 */

import { useState } from "react";
import Link from "next/link";
import { getUsers, saveUsers } from "@/services/storage";
import type { StorageUserRecord } from "@/services/storage";

function mergeUsers(
  existing: StorageUserRecord[],
  incoming: StorageUserRecord[]
): StorageUserRecord[] {
  const byId = new Map(existing.map((u) => [u.id, u]));
  const byEmail = new Map(existing.map((u) => [u.email.toLowerCase(), u]));
  for (const u of incoming) {
    if (!u || typeof u !== "object" || !u.id || !u.email) continue;
    const key = u.id;
    const emailKey = u.email.toLowerCase();
    const existingUser = byId.get(key) ?? byEmail.get(emailKey);
    if (existingUser) {
      const merged = { ...existingUser };
      for (const k of Object.keys(u) as Array<keyof StorageUserRecord>) {
        const v = u[k];
        if (v !== undefined && v !== null && v !== "") {
          (merged as Record<string, unknown>)[k] = v;
        }
      }
      merged.updatedAt = new Date().toISOString();
      byId.set(merged.id, merged);
      byEmail.set(merged.email.toLowerCase(), merged);
    } else {
      const normalized = {
        ...u,
        email: u.email.toLowerCase(),
        updatedAt: u.updatedAt ?? new Date().toISOString(),
        createdAt: u.createdAt ?? new Date().toISOString(),
      };
      byId.set(normalized.id, normalized);
      byEmail.set(normalized.email.toLowerCase(), normalized);
    }
  }
  return Array.from(byId.values());
}

export default function DevStoragePage() {
  const [status, setStatus] = useState<string>("");
  const [importText, setImportText] = useState("");

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-xl font-bold text-green-900">Không có quyền truy cập</h1>
        <p className="mt-2 text-green-900/70">Trang này chỉ khả dụng trong môi trường dev.</p>
        <Link href="/" className="mt-4 inline-block text-green-700 hover:underline">
          ← Quay lại
        </Link>
      </div>
    );
  }

  function handleExport() {
    const users = getUsers();
    const json = JSON.stringify(users, null, 2);
    void navigator.clipboard.writeText(json).then(() => {
      setStatus(`Đã sao chép ${users.length} user vào clipboard.`);
      setTimeout(() => setStatus(""), 3000);
    });
  }

  function handleImport() {
    setStatus("");
    try {
      const parsed = JSON.parse(importText) as StorageUserRecord[];
      if (!Array.isArray(parsed)) {
        setStatus("JSON không hợp lệ: cần mảng users.");
        return;
      }
      const existing = getUsers();
      const merged = mergeUsers(existing, parsed);
      saveUsers(merged);
      setStatus(`Đã merge ${parsed.length} user. Tổng: ${merged.length}. Cần refresh trang để áp dụng.`);
      setImportText("");
    } catch (e) {
      setStatus("Lỗi parse JSON: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-bold text-green-900">Dev – Storage Export/Import</h1>
      <p className="text-sm text-green-900/70">
        localStorage là theo domain. Khi chuyển từ localhost sang IP/server khác, dữ liệu
        không đồng bộ. Export từ máy cũ → copy → Import tại máy mới.
      </p>

      <section className="rounded-lg border border-green-200 bg-white p-4">
        <h2 className="font-semibold text-green-900">Export users</h2>
        <p className="mt-1 text-sm text-green-900/70">
          Sao chép toàn bộ users (JSON) vào clipboard.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="mt-3 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Export users (copy)
        </button>
      </section>

      <section className="rounded-lg border border-green-200 bg-white p-4">
        <h2 className="font-semibold text-green-900">Import users</h2>
        <p className="mt-1 text-sm text-green-900/70">
          Dán JSON (mảng users). Merge theo id/email; không ghi đè field nếu incoming trống.
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='[{"id":"u-1","email":"...","displayName":"...", ...}]'
          rows={6}
          className="mt-2 w-full rounded border border-green-200 p-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={handleImport}
          className="mt-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Import (merge)
        </button>
      </section>

      {status ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {status}
        </p>
      ) : null}

      <Link href="/" className="block text-green-700 hover:underline">
        ← Quay lại trang chủ
      </Link>
    </div>
  );
}
