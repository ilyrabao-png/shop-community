"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!displayName.trim()) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    setLoading(true);
    const result = await register(email.trim(), password, displayName.trim());
    setLoading(false);
    if (result.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold text-green-900">Đăng ký</h1>
      <p className="mt-1 text-sm text-green-900/70">
        Tạo tài khoản để bán nông sản và tham gia cộng đồng
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
          <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-green-900">
            Email
          </label>
          <Input
            id="reg-email"
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
          <label htmlFor="reg-displayName" className="mb-1 block text-sm font-medium text-green-900">
            Tên hiển thị
          </label>
          <Input
            id="reg-displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tên của bạn"
            className="border-green-200 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-green-900">
            Mật khẩu (tối thiểu 6 ký tự)
          </label>
          <Input
            id="reg-password"
            type="password"
            autoComplete="new-password"
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
          {loading ? "Đang đăng ký…" : "Đăng ký"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-green-900/70">
        Đã có tài khoản?{" "}
        <Link href="/auth/login" className="font-medium text-green-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
