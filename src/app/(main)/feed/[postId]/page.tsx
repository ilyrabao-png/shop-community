/**
 * TEST: /feed/<somePostId>
 * - like/unlike works, delete post/comment (owner only)
 * - Like post => notification for owner; Comment on post => notification for owner
 */

import { PostDetailPageWrapper } from "@/features/community/PostDetailPageWrapper";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <div className="mx-auto max-w-2xl">
      <PostDetailPageWrapper postId={postId} />
    </div>
  );
}
