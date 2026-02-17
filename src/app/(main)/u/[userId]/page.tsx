/**
 * Public user profile: /u/[userId]
 * Header (avatar, name, bio, join date), tabs (Products/Posts/Reviews), Follow/Unfollow
 */

import { PublicProfileClient } from "@/features/profile/PublicProfileClient";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <PublicProfileClient userId={userId} />;
}
