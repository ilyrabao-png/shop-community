"use client";

/**
 * TEST CHECKLIST:
 * - /profile: upload PNG <=2MB -> avatar updates immediately (profile + navbar)
 * - Refresh page -> avatar still there
 * - Navigate to /shop then back -> avatar still there
 * - Switch user (logout, login as different user) -> different avatar per user
 * - File >2MB or wrong type -> shows error and does not save
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { getMyListings, getPublicUserById } from "@/services/api";
import type { SocialLinks } from "@/types/models";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPT_TYPES = "image/png,image/jpeg,image/jpg,image/webp";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, updateAvatar } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialZalo, setSocialZalo] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);
  const [listings, setListings] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login?next=/profile");
      return;
    }
    setDisplayName(user.displayName);
    setAvatarDataUrl(user.avatarUrl ?? null);
    const pub = getPublicUserById(user.id);
    if (pub) {
      setBio(pub.bio ?? "");
      setLocation(pub.location ?? "");
      setPhone(pub.phone ?? "");
      setSocialFacebook(pub.socialLinks?.facebook ?? "");
      setSocialZalo(pub.socialLinks?.zalo ?? "");
      setSocialWebsite(pub.socialLinks?.website ?? "");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    getMyListings(user.id)
      .then((products) => setListings(products.map((p) => ({ id: String(p.id), name: p.name }))))
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  }, [user]);

  if (!user) return null;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      setAvatarError("Chỉ chấp nhận ảnh PNG, JPG hoặc WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Ảnh không được vượt quá 2MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarDataUrl(dataUrl);
      // Save immediately so avatar persists and navbar updates without form submit
      if (user) {
        updateAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemoveAvatar() {
    setAvatarDataUrl(null);
    setAvatarError(null);
    if (user) {
      updateAvatar(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const socialLinks: SocialLinks = {};
    if (socialFacebook.trim()) socialLinks.facebook = socialFacebook.trim();
    if (socialZalo.trim()) socialLinks.zalo = socialZalo.trim();
    if (socialWebsite.trim()) socialLinks.website = socialWebsite.trim();

    updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      location: location.trim() || undefined,
      phone: phone.trim() || undefined,
      socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
    });
    updateAvatar(avatarDataUrl);
    setMessage("saved");
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-green-900">Hồ sơ</h1>

      <section className="rounded-xl border border-green-200/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-900">Thông tin cá nhân</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-green-900">
              Ảnh đại diện
            </label>
            <div className="flex items-center gap-4">
              {avatarDataUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarDataUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-amber-600"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-semibold text-green-800">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_TYPES}
                  onChange={handleAvatarChange}
                  className="sr-only"
                  aria-label="Chọn ảnh đại diện"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  className="border border-green-300 bg-white text-green-800 hover:bg-green-50"
                >
                  Chọn ảnh (PNG/JPG/WebP, tối đa 2MB)
                </Button>
                {avatarError ? (
                  <p className="mt-1 text-sm text-amber-700">{avatarError}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-green-900">
              Tên hiển thị
            </label>
            <Input
              id="profile-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-green-200 focus:ring-green-700/40"
            />
          </div>

          <div>
            <label htmlFor="profile-bio" className="mb-1 block text-sm font-medium text-green-900">
              Giới thiệu ngắn
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
              placeholder="Vài dòng về bạn..."
            />
          </div>

          <div>
            <label htmlFor="profile-location" className="mb-1 block text-sm font-medium text-green-900">
              Địa chỉ
            </label>
            <Input
              id="profile-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Thành phố, quận..."
              className="border-green-200 focus:ring-green-700/40"
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-green-900">
              Số điện thoại
            </label>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại liên hệ"
              className="border-green-200 focus:ring-green-700/40"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-green-900">Liên kết mạng xã hội</p>
            <div className="space-y-2">
              <Input
                type="url"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="Facebook"
                className="border-green-200 focus:ring-green-700/40"
              />
              <Input
                type="text"
                value={socialZalo}
                onChange={(e) => setSocialZalo(e.target.value)}
                placeholder="Zalo"
                className="border-green-200 focus:ring-green-700/40"
              />
              <Input
                type="url"
                value={socialWebsite}
                onChange={(e) => setSocialWebsite(e.target.value)}
                placeholder="Website"
                className="border-green-200 focus:ring-green-700/40"
              />
            </div>
          </div>

          <p className="text-sm text-green-900/60">{user.email}</p>

          {message === "saved" ? (
            <p className="text-sm font-medium text-green-700">Đã lưu.</p>
          ) : null}

          <Button type="submit" className="bg-green-700 hover:bg-green-800 focus:ring-green-700/40">
            Lưu thay đổi
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-green-200/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-900">Sản phẩm đang bán</h2>
        {loadingListings ? (
          <p className="mt-2 text-sm text-green-900/60">Đang tải…</p>
        ) : listings.length === 0 ? (
          <p className="mt-2 text-sm text-green-900/60">Chưa có sản phẩm nào.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {listings.map((p) => (
              <li key={p.id}>
                <Link href={`/shop/${p.id}`} className="text-sm text-green-700 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/sell"
          className="mt-3 inline-block text-sm font-medium text-green-700 hover:underline"
        >
          Đăng bán sản phẩm →
        </Link>
      </section>

      <section className="rounded-xl border border-green-200/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-900">Bài đăng</h2>
        <p className="mt-2 text-sm text-green-900/60">Tính năng đang phát triển.</p>
      </section>
    </div>
  );
}
