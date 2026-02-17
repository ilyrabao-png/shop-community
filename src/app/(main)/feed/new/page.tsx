"use client";

/** TEST: /feed/new - create works; redirect to /feed with new post at top */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { PostComposer } from "@/features/community/PostComposer";
import { getAdminSettings } from "@/services/api";

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [postingDisabled, setPostingDisabled] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // still hydrating
    if (!user) {
      router.replace("/auth/login?next=/feed/new");
    }
  }, [user, router]);

  useEffect(() => {
    setPostingDisabled(!getAdminSettings().enableNewPost);
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-green-900">Tạo bài đăng</h1>
      {postingDisabled ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Đăng bài mới đang tạm khóa.
        </p>
      ) : (
        <PostComposer />
      )}
    </div>
  );
}
