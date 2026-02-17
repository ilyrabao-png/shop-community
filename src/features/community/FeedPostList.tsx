"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Post } from "@/types/models";
import { useAuth } from "@/store/useAuth";
import { useNotifications } from "@/store/notifications";
import {
  getUserById,
  deletePost,
  getPosts,
  togglePostLike,
  getAdminSettings,
} from "@/services/api";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui";

export function FeedPostList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentUserId = user?.id ?? null;
  const { refresh: refreshNotifications } = useNotifications();

  useEffect(() => {
    getPosts({ limit: 25, userId: currentUserId ?? undefined }).then((r) =>
      setPosts(r.items)
    );
  }, [searchParams.get("r"), currentUserId]);

  async function handleLike(postId: string) {
    if (!currentUserId) return;
    const post = posts.find((p) => String(p.id) === postId);
    if (!post) return;
    const nextLiked = !post.likedByMe;
    const nextCount = post.likeCount + (nextLiked ? 1 : -1);
    setPosts((prev) =>
      prev.map((p) =>
        String(p.id) === postId
          ? { ...p, likedByMe: nextLiked, likeCount: nextCount }
          : p
      )
    );
    try {
      const res = await togglePostLike(
        postId as import("@/types/models").PostId,
        currentUserId
      );
      setPosts((prev) =>
        prev.map((p) =>
          String(p.id) === postId
            ? { ...p, likedByMe: res.liked, likeCount: res.likeCount }
            : p
        )
      );
      if (res.liked) refreshNotifications();
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          String(p.id) === postId
            ? { ...p, likedByMe: post.likedByMe, likeCount: post.likeCount }
            : p
        )
      );
    }
  }

  async function handleDelete(postId: string) {
    if (!currentUserId) return;
    try {
      await deletePost(postId as import("@/types/models").PostId, currentUserId);
      setPosts((prev) => prev.filter((p) => String(p.id) !== postId));
    } catch {
      // ignore
    }
  }

  const canPost = getAdminSettings().enableNewPost;

  return (
    <div className="space-y-4">
      {canPost ? (
        <Link href="/feed/new">
          <Button className="bg-green-700 hover:bg-green-800">Tạo bài đăng mới</Button>
        </Link>
      ) : null}
      {posts.length === 0 ? (
        <p className="rounded-lg border border-green-200 bg-green-50/50 px-4 py-6 text-center text-sm text-green-900/70">
          Chưa có bài đăng nào.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => {
            const postUser = getUserById(post.userId);
            const isOwner = currentUserId && post.userId === currentUserId;
            return (
              <li
                key={String(post.id)}
                className="rounded-xl border border-green-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar userId={post.userId} size="sm" />
                    <div>
                      <Link
                        href={`/u/${post.userId}`}
                        className="font-medium text-green-900 hover:text-green-700 hover:underline"
                      >
                        {postUser?.displayName ?? "User"}
                      </Link>
                      <span className="ml-2 text-xs text-green-900/50">
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/feed/${post.id}`}>
                      <Button variant="ghost" className="text-green-700">
                        Xem
                      </Button>
                    </Link>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(String(post.id))}
                        className="text-sm text-amber-600 hover:text-amber-800"
                      >
                        Xóa
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-green-900/80">{post.content}</p>
                {post.imageUrls?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.imageUrls.map((url, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 flex items-center gap-4 text-sm text-green-900/60">
                  <button
                    type="button"
                    onClick={() => handleLike(String(post.id))}
                    aria-label={post.likedByMe ? "Bỏ thích" : "Thích"}
                    className={`inline-flex items-center gap-1 rounded px-1 py-0.5 transition hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-700/40 ${
                      post.likedByMe
                        ? "text-red-600"
                        : "text-green-900/60 hover:text-red-500"
                    }`}
                  >
                    {post.likedByMe ? (
                      <span className="text-base" aria-hidden>
                        ❤️
                      </span>
                    ) : (
                      <span className="text-base" aria-hidden>
                        🤍
                      </span>
                    )}
                    <span>{post.likeCount}</span>
                  </button>
                  <Link href={`/feed/${post.id}`} className="hover:underline">
                    💬 {post.commentCount}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
