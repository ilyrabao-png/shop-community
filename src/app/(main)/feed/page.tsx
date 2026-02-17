/**
 * TEST: /feed
 * - heart button clickable, like/unlike toggles, like count changes immediately
 * - list + new post visible after create; empty: "Chưa có bài đăng nào"
 * - Like post (as other user) => notification appears for post owner
 */

import { Suspense } from "react";
import { FeedPostList } from "@/features/community/FeedPostList";

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Feed</h1>
      <Suspense fallback={<p className="text-green-900/60">Đang tải…</p>}>
        <FeedPostList initialPosts={[]} />
      </Suspense>
    </div>
  );
}
