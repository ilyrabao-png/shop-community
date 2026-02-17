"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import {
  adminListReviews,
  adminUpdateReview,
  adminListProducts,
  adminListUsers,
} from "@/services/api";
import type { Review, ContentStatus } from "@/types/models";

export function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [minRating, setMinRating] = useState("");

  function load() {
    setReviews(
      adminListReviews({
        status: statusFilter || undefined,
        minRating: minRating ? parseInt(minRating, 10) : undefined,
      })
    );
  }

  useEffect(load, [statusFilter, minRating]);

  function handleToggleHidden(r: Review) {
    const s = (r.status ?? "active") as ContentStatus;
    adminUpdateReview(r.id, { status: s === "hidden" ? "active" : "hidden" });
    load();
  }

  function handleDelete(r: Review) {
    adminUpdateReview(r.id, { status: "deleted" });
    load();
  }

  const products = adminListProducts({});
  const users = adminListUsers({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-900">Quản lý đánh giá</h1>
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
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả đánh giá</option>
          <option value="1">≥ 1 sao</option>
          <option value="2">≥ 2 sao</option>
          <option value="3">≥ 3 sao</option>
          <option value="4">≥ 4 sao</option>
          <option value="5">5 sao</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-200 bg-green-50/50">
              <th className="px-4 py-3 text-left font-medium text-green-900">Sản phẩm</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Người đánh giá</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Sao</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Nội dung</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => {
              const product = products.find((p) => p.id === r.productId);
              const reviewer = users.find((u) => u.id === r.userId);
              return (
                <tr key={r.id} className="border-b border-green-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/shop/${r.productId}`}
                      className="text-green-700 hover:underline"
                    >
                      {product?.name ?? r.productId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/u/${r.userId}`}
                      className="text-green-700 hover:underline"
                    >
                      {reviewer?.displayName ?? r.userId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.rating}★</td>
                  <td className="max-w-xs truncate px-4 py-3 text-green-900">
                    {r.body ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        (r.status ?? "active") === "active"
                          ? "bg-green-100 text-green-700"
                          : (r.status ?? "active") === "hidden"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {r.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/shop/${r.productId}`}>
                        <Button variant="ghost" className="text-xs">
                          Xem SP
                        </Button>
                      </Link>
                      {(r.status ?? "active") !== "deleted" ? (
                        <>
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => handleToggleHidden(r)}
                          >
                            {(r.status ?? "active") === "hidden" ? "Hiện" : "Ẩn"}
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-xs text-amber-700"
                            onClick={() => handleDelete(r)}
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
    </div>
  );
}
