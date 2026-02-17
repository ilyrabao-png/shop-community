"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { isAdmin } from "@/services/api";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAccessDenied(false);
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      if (!isAdmin(result.user.id)) {
        setAccessDenied(true);
        return;
      }
      router.push(next);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-green-900">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-green-900/70">
          Tài khoản của bạn không có quyền admin. Vui lòng đăng nhập bằng tài khoản admin
          hoặc quay lại trang chủ.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/auth/login"
            className="rounded-lg bg-green-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-800"
          >
            Đăng nhập (người dùng)
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-green-200 px-4 py-2 text-center text-sm font-medium text-green-800 hover:bg-green-50"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-green-200 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
        Admin
      </div>
      <h1 className="text-2xl font-bold text-green-900">ADMIN – Đăng nhập</h1>
      <p className="mt-1 text-sm text-green-900/70">
        Đăng nhập bằng tài khoản admin để truy cập khu vực quản trị.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            {error}
          </div>
        ) : null}
        <div>
          <label htmlFor="admin-login-email" className="mb-1 block text-sm font-medium text-green-900">
            Email
          </label>
          <Input
            id="admin-login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@bmarket.local"
            className="border-green-200 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="admin-login-password" className="mb-1 block text-sm font-medium text-green-900">
            Mật khẩu
          </label>
          <Input
            id="admin-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border-green-200 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 focus:ring-green-700/40"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập…" : "Đăng nhập Admin"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-green-900/70">
        <Link href="/" className="font-medium text-green-700 hover:underline">
          ← Quay lại trang chủ
        </Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="text-green-900/70">Đang tải…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
