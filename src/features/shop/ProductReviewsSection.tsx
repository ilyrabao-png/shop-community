"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductId, Review, UserId } from "@/types/models";
import { getReviewsByProduct, addReview, getUserById } from "@/services/api";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/store/useAuth";
import { useNotifications } from "@/store/notifications";
import { Button } from "@/components/ui";
import { Stars } from "@/components/ui";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

function UserDisplay({ userId }: { userId: UserId }) {
  const user = getUserById(userId);
  return (
    <Link
      href={`/u/${userId}`}
      className="flex items-center gap-2 font-medium text-green-900 hover:text-green-700 hover:underline"
    >
      <UserAvatar userId={userId} size="sm" clickable={false} />
      {user?.displayName ?? "Khách"}
    </Link>
  );
}

export function ProductReviewsSection({
  productId,
  onReviewAdded,
}: {
  productId: ProductId;
  onReviewAdded?: () => void;
}) {
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getReviewsByProduct(productId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }
    if (!body.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setSubmitting(true);
    try {
      const newReview = await addReview({
        productId,
        userId: user.id,
        rating,
        body: body.trim(),
      });
      setReviews((prev) => [newReview, ...prev]);
      setBody("");
      setRating(5);
      onReviewAdded?.();
      refreshNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-green-900">Đánh giá</h2>
      {user ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
          {error ? (
            <p className="text-sm text-amber-700">{error}</p>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-green-900">Số sao</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`text-2xl ${rating >= s ? "text-amber-500" : "text-amber-200"}`}
                  aria-label={`${s} sao`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-body" className="block text-sm font-medium text-green-900">
              Nội dung
            </label>
            <textarea
              id="review-body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
              placeholder="Chia sẻ trải nghiệm của bạn..."
              disabled={submitting}
            />
          </div>
          <Button
            type="submit"
            className="bg-green-700 hover:bg-green-800"
            disabled={submitting}
          >
            {submitting ? "Đang gửi…" : "Gửi đánh giá"}
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-green-900/70">
          <Link href="/auth/login" className="text-green-700 hover:underline">
            Đăng nhập
          </Link>{" "}
          để gửi đánh giá.
        </p>
      )}
      {loading ? (
        <p className="mt-4 text-sm text-green-900/60">Đang tải đánh giá…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-green-900/60">Chưa có đánh giá nào.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((r) => (
            <li
              key={String(r.id)}
              className="rounded-lg border border-green-100 bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <Stars rating={r.rating} size="sm" />
                <UserDisplay userId={r.userId} />
                <span className="text-xs text-green-900/50">{formatDate(r.createdAt)}</span>
              </div>
              {r.body ? <p className="mt-1 text-sm text-green-900/80">{r.body}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
