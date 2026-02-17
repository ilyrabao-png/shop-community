"use client";

/**
 * Post detail (client fetch - API uses localStorage)
 * TEST: /feed/[postId] - detail + delete/comment works (owner only)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/services/api";
import { useAuth } from "@/store/useAuth";
import type { Post, Comment, PostId } from "@/types/models";
import { PostDetailClient } from "./PostDetailClient";

export function PostDetailPageWrapper({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<{ post: Post; comments: Comment[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostById(postId as PostId, user?.id ?? null)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [postId, user?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/feed" className="text-sm text-green-700 hover:underline">
          ← Feed
        </Link>
        <div className="mt-4 flex items-center justify-center py-16">
          <span className="text-green-900/60">Đang tải…</span>
        </div>
      </div>
    );
  }

  if (!data) {
    notFound();
    return null;
  }

  return (
    <>
      <Link href="/feed" className="text-sm text-green-700 hover:underline">
        ← Feed
      </Link>
      <PostDetailClient post={data.post} comments={data.comments} />
    </>
  );
}
