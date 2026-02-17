"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserId } from "@/types/models";
import { useAuth } from "@/store/useAuth";
import {
  getPublicUserById,
  listProductsByUser,
  listPostsByUser,
  getReviewsForProductsByUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
} from "@/services/api";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui";
import { Stars } from "@/components/ui";
import type { PublicUser } from "@/types/models";
import type { Product, Post, Review } from "@/types/models";

type TabId = "products" | "posts" | "reviews";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
  });
}

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

export function PublicProfileClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const uid = userId as UserId;

  const [profile, setProfile] = useState<PublicUser | null | "loading">("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followers, setFollowers] = useState<UserId[]>([]);
  const [following, setFollowing] = useState<UserId[]>([]);
  const [followingThis, setFollowingThis] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    const pub = getPublicUserById(uid);
    if (!pub) {
      setProfile(null);
      return;
    }
    setProfile(pub);
    setFollowers(getFollowers(uid));
    setFollowing(getFollowing(uid));
    setFollowingThis(currentUser ? isFollowing(currentUser.id, uid) : false);
  }, [uid, currentUser?.id]);

  useEffect(() => {
    if (profile === null || profile === "loading") return;
    setLoadingTab(true);
    if (activeTab === "products") {
      listProductsByUser(uid)
        .then(setProducts)
        .catch(() => setProducts([]))
        .finally(() => setLoadingTab(false));
    } else if (activeTab === "posts") {
      listPostsByUser(uid)
        .then(setPosts)
        .catch(() => setPosts([]))
        .finally(() => setLoadingTab(false));
    } else {
      getReviewsForProductsByUser(uid)
        .then(setReviews)
        .catch(() => setReviews([]))
        .finally(() => setLoadingTab(false));
    }
  }, [uid, activeTab, profile]);

  function handleFollow() {
    if (!currentUser) {
      router.push("/auth/login?next=/u/" + encodeURIComponent(userId));
      return;
    }
    if (followingThis) {
      unfollowUser(currentUser.id, uid);
      setFollowingThis(false);
      setFollowers((prev) => prev.filter((id) => id !== currentUser.id));
    } else {
      followUser(currentUser.id, uid);
      setFollowingThis(true);
      setFollowers((prev) => [...prev, currentUser.id]);
    }
  }

  if (profile === "loading") {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <p className="text-green-900/60">Đang tải…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="text-xl font-bold text-green-900">Không tìm thấy</h1>
        <p className="mt-2 text-green-900/70">Người dùng này không tồn tại.</p>
        <Link href="/feed" className="mt-4 inline-block text-green-700 hover:underline">
          ← Quay lại Feed
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === uid;
  const tabs: { id: TabId; label: string }[] = [
    { id: "products", label: "Bán hàng" },
    { id: "posts", label: "Bài viết" },
    { id: "reviews", label: "Đánh giá" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <UserAvatar user={profile} size="lg" clickable={false} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-bold text-green-900">{profile.displayName}</h1>
            {profile.bio ? (
              <p className="mt-1 text-green-900/80">{profile.bio}</p>
            ) : null}
            <p className="mt-1 text-sm text-green-900/50">
              Tham gia {formatDate(profile.createdAt)}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <span className="text-sm text-green-900/70">
                <strong className="text-green-900">{followers.length}</strong> người theo dõi
              </span>
              <span className="text-sm text-green-900/70">
                <strong className="text-green-900">{following.length}</strong> đang theo dõi
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {isOwnProfile ? (
                <Link href="/profile">
                  <Button className="bg-green-700 hover:bg-green-800">
                    Chỉnh sửa hồ sơ
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleFollow}
                  className={
                    followingThis
                      ? "border border-green-300 bg-white text-green-800 hover:bg-green-50"
                      : "bg-green-700 hover:bg-green-800"
                  }
                >
                  {followingThis ? "Đã theo dõi" : "Theo dõi"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-2 border-b border-green-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-green-700 text-green-800"
                  : "border-transparent text-green-900/70 hover:text-green-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 min-h-[120px]">
          {loadingTab ? (
            <p className="py-8 text-center text-green-900/60">Đang tải…</p>
          ) : activeTab === "products" ? (
            products.length === 0 ? (
              <p className="py-8 text-center text-green-900/60">Chưa có sản phẩm nào.</p>
            ) : (
              <ul className="space-y-4">
                {products.map((p) => (
                  <li key={String(p.id)}>
                    <Link
                      href={`/shop/${p.id}`}
                      className="flex gap-4 rounded-lg border border-green-100 p-3 transition hover:bg-green-50/50"
                    >
                      {p.imageUrls?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.imageUrls[0]}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 text-2xl">
                          🌱
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-green-900 truncate">{p.name}</p>
                        <p className="text-sm text-green-900/70">
                          {formatVnd(Math.min(...p.variants.map((v) => v.unitPrice)))}
                          {p.unit ? ` / ${p.unit}` : ""}
                        </p>
                        <Stars rating={p.avgRating ?? 0} count={p.reviewCount ?? 0} size="sm" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === "posts" ? (
            posts.length === 0 ? (
              <p className="py-8 text-center text-green-900/60">Chưa có bài viết nào.</p>
            ) : (
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li
                    key={String(post.id)}
                    className="rounded-lg border border-green-100 bg-white p-4"
                  >
                    <Link href={`/feed/${post.id}`} className="block">
                      <p className="text-green-900/90 line-clamp-2">{post.content}</p>
                      <p className="mt-2 text-xs text-green-900/50">
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")} · ❤️ {post.likeCount}{" "}
                        · 💬 {post.commentCount}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            reviews.length === 0 ? (
              <p className="py-8 text-center text-green-900/60">Chưa có đánh giá nào.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li
                    key={String(r.id)}
                    className="rounded-lg border border-green-100 bg-green-50/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} size="sm" />
                      <Link
                        href={`/shop/${r.productId}`}
                        className="text-sm font-medium text-green-800 hover:underline"
                      >
                        Xem sản phẩm
                      </Link>
                    </div>
                    {r.body ? (
                      <p className="mt-1 text-sm text-green-900/80">{r.body}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-green-900/50">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
