"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
      router.push(next);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-green-900">Đăng nhập</h1>
      <p className="mt-1 text-sm text-green-900/70">
        Đăng nhập để bán hàng và quản lý tài khoản
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
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-green-900">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-green-200 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-green-900">
            Mật khẩu
          </label>
          <Input
            id="login-password"
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
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-green-900/70">
        Chưa có tài khoản?{" "}
        <Link href="/auth/register" className="font-medium text-green-700 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-green-900/70">Đang tải…</div>}>
      <LoginForm />
    </Suspense>
  );
}
