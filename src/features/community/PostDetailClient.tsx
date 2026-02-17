"use client";

import { useState } from "react";
import Link from "next/link";
import type { Post, Comment } from "@/types/models";
import { useAuth } from "@/store/useAuth";
import { useNotifications } from "@/store/notifications";
import {
  getUserById,
  addComment,
  deletePost,
  deleteComment,
  togglePostLike,
} from "@/services/api";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

export function PostDetailClient({
  post: initialPost,
  comments: initialComments,
}: {
  post: Post;
  comments: Comment[];
}) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const { refresh: refreshNotifications } = useNotifications();
  const isOwner = currentUserId && post.userId === currentUserId;
  const postUser = getUserById(post.userId);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !currentUserId) return;
    setSubmitting(true);
    try {
      const c = await addComment({
        postId: post.id,
        userId: currentUserId,
        content: content.trim(),
      });
      setComments((prev) => [...prev, c]);
      setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
      setContent("");
      refreshNotifications();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePost() {
    if (!currentUserId) return;
    try {
      await deletePost(post.id, currentUserId);
      window.location.href = "/feed";
    } catch {
      // ignore
    }
  }

  async function handleLike() {
    if (!currentUserId) return;
    const nextLiked = !post.likedByMe;
    const nextCount = post.likeCount + (nextLiked ? 1 : -1);
    setPost((p) => ({ ...p, likedByMe: nextLiked, likeCount: nextCount }));
    try {
      const res = await togglePostLike(post.id, currentUserId);
      setPost((p) => ({ ...p, likedByMe: res.liked, likeCount: res.likeCount }));
      if (res.liked) refreshNotifications();
    } catch {
      setPost((p) => ({
        ...p,
        likedByMe: !nextLiked,
        likeCount: nextCount + (nextLiked ? -1 : 1),
      }));
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!currentUserId) return;
    try {
      await deleteComment(
        commentId as import("@/types/models").CommentId,
        currentUserId
      );
      setComments((prev) => prev.filter((c) => String(c.id) !== commentId));
      setPost((p) => ({ ...p, commentCount: Math.max(0, p.commentCount - 1) }));
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4 space-y-6">
      <article className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar userId={post.userId} size="md" />
            <div>
              <Link
                href={`/u/${post.userId}`}
                className="font-medium text-green-900 hover:text-green-700 hover:underline"
              >
                {postUser?.displayName ?? "User"}
              </Link>
              <span className="ml-2 text-sm text-green-900/50">
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          {isOwner ? (
            <button
              type="button"
              onClick={handleDeletePost}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              Xóa bài
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-green-900/80">{post.content}</p>
        {post.imageUrls?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.imageUrls.map((url, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={url}
                alt=""
                className="h-32 w-32 rounded-lg object-cover"
              />
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex items-center gap-4 text-sm text-green-900/60">
          <button
            type="button"
            onClick={handleLike}
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
          <span>·</span>
          <span>💬 {post.commentCount}</span>
        </div>
      </article>

      <section>
        <h2 className="text-lg font-semibold text-green-900">Bình luận</h2>
        {currentUserId ? (
          <form onSubmit={handleAddComment} className="mt-2 flex gap-2">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 border-green-200"
              disabled={submitting}
            />
            <Button type="submit" disabled={submitting} className="bg-green-700">
              Gửi
            </Button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-green-900/70">
            <Link href="/auth/login" className="text-green-700 hover:underline">
              Đăng nhập
            </Link>{" "}
            để bình luận.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {comments.map((c) => {
            const commentUser = getUserById(c.userId);
            const canDelete = currentUserId && c.userId === currentUserId;
            return (
              <li
                key={String(c.id)}
                className="flex items-start justify-between gap-2 rounded-lg border border-green-100 bg-green-50/30 p-3"
              >
                <div className="flex items-start gap-2">
                  <UserAvatar userId={c.userId} size="sm" />
                  <div>
                    <Link
                      href={`/u/${c.userId}`}
                      className="font-medium text-green-900 hover:text-green-700 hover:underline"
                    >
                      {commentUser?.displayName ?? "User"}
                    </Link>
                    <span className="ml-2 text-xs text-green-900/50">
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <p className="mt-0.5 text-sm text-green-900/80">{c.content}</p>
                  </div>
                </div>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(String(c.id))}
                    className="shrink-0 text-xs text-amber-600 hover:text-amber-800"
                  >
                    Xóa
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
