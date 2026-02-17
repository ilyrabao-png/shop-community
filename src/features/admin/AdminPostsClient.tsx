"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { Modal } from "@/components/ui";
import {
  adminListPosts,
  adminUpdatePost,
  adminUpdateComment,
  adminListUsers,
  adminListCommentsByPost,
} from "@/services/api";
import type { Post, Comment, ContentStatus } from "@/types/models";

export function AdminPostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  function load() {
    setPosts(
      adminListPosts({
        status: statusFilter || undefined,
        authorId: authorFilter ? (authorFilter as import("@/types/models").UserId) : undefined,
      })
    );
  }

  useEffect(load, [statusFilter, authorFilter]);

  function openDetail(p: Post) {
    setDetailPost(p);
    setComments(adminListCommentsByPost(p.id));
  }

  function handleToggleHidden(p: Post) {
    const s = (p.status ?? "active") as ContentStatus;
    adminUpdatePost(p.id, { status: s === "hidden" ? "active" : "hidden" });
    load();
    if (detailPost?.id === p.id) setDetailPost(null);
  }

  function handleDeletePost(p: Post) {
    adminUpdatePost(p.id, { status: "deleted" });
    load();
    setDetailPost(null);
  }

  function handleHideComment(c: Comment) {
    adminUpdateComment(c.id, { status: "hidden" });
    if (detailPost) setComments(adminListCommentsByPost(detailPost.id));
  }

  const users = adminListUsers({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-900">Quản lý bài viết</h1>
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter((e.target.value || "") as ContentStatus | "")
          }
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hiển thị</option>
          <option value="hidden">Ẩn</option>
          <option value="deleted">Đã xóa</option>
        </select>
        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả tác giả</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-200 bg-green-50/50">
              <th className="px-4 py-3 text-left font-medium text-green-900">Tác giả</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Nội dung</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Thích</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Bình luận</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => {
              const author = users.find((u) => u.id === p.userId);
              return (
                <tr key={p.id} className="border-b border-green-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/u/${p.userId}`}
                      className="text-green-700 hover:underline"
                    >
                      {author?.displayName ?? p.userId}
                    </Link>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-green-900">
                    {p.content.slice(0, 80)}...
                  </td>
                  <td className="px-4 py-3">{p.likeCount}</td>
                  <td className="px-4 py-3">{p.commentCount}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        (p.status ?? "active") === "active"
                          ? "bg-green-100 text-green-700"
                          : (p.status ?? "active") === "hidden"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {p.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/feed/${p.id}`}>
                        <Button variant="ghost" className="text-xs">
                          Xem
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => openDetail(p)}
                      >
                        Bình luận
                      </Button>
                      {(p.status ?? "active") !== "deleted" ? (
                        <>
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => handleToggleHidden(p)}
                          >
                            {(p.status ?? "active") === "hidden" ? "Hiện" : "Ẩn"}
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-xs text-amber-700"
                            onClick={() => handleDeletePost(p)}
                          >
                            Xóa
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal
        open={!!detailPost}
        onClose={() => setDetailPost(null)}
        title={detailPost ? "Bình luận" : ""}
      >
        {detailPost ? (
          <div>
            <p className="mb-4 text-sm text-green-900/80">{detailPost.content}</p>
            <ul className="space-y-2">
              {comments.map((c) => {
                const u = users.find((x) => x.id === c.userId);
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded border border-green-100 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">{u?.displayName ?? "?"}</span>
                      <p className="text-sm text-green-900/80">{c.content}</p>
                    </div>
                    {(c.status ?? "active") === "active" ? (
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => handleHideComment(c)}
                      >
                        Ẩn
                      </Button>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">Đã ẩn</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
            {comments.length === 0 && (
              <p className="text-sm text-green-900/60">Không có bình luận.</p>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
