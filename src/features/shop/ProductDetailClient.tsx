"use client";

/**
 * Product detail (client fetch - API uses localStorage)
 * TEST: /shop/[id] - detail + reviews, stars, review form, immediate update after add
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getUserById } from "@/services/api";
import type { Product, ProductId } from "@/types/models";
import { UserAvatar } from "@/components/UserAvatar";
import { Stars } from "@/components/ui";
import { ProductDetailActions } from "@/features/shop/ProductDetailActions";
import { ProductReviewsSection } from "@/features/shop/ProductReviewsSection";

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

export function ProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(productId as ProductId)
      .then((p) => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/shop" className="text-sm text-green-700 hover:underline">
          ← Cửa hàng
        </Link>
        <div className="mt-4 flex items-center justify-center py-16">
          <span className="text-green-900/60">Đang tải…</span>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
    return null;
  }

  const minPrice = Math.min(...product.variants.map((v) => v.unitPrice));
  const maxPrice = Math.max(...product.variants.map((v) => v.unitPrice));
  const hasRange = minPrice !== maxPrice;
  const images = product.imageUrls?.length ? product.imageUrls : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/shop" className="text-sm text-green-700 hover:underline">
        ← Cửa hàng
      </Link>
      <div className="mt-4 rounded-xl border border-green-200 bg-white p-6 shadow-sm">
        {images.length > 0 ? (
          <div className="space-y-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-green-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(1, 5).map((url, i) => (
                  <div
                    key={i}
                    className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-green-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-green-50 text-6xl">
            🌱
          </div>
        )}
        <h1 className="mt-4 text-xl font-bold text-green-900">{product.name}</h1>
        {product.category ? (
          <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
            {product.category}
          </span>
        ) : null}
        <div className="mt-2">
          <Stars
            rating={product.avgRating ?? 0}
            count={product.reviewCount ?? 0}
            size="md"
          />
        </div>
        <p className="mt-2 text-green-900/70">{product.description}</p>
        <div className="mt-4">
          <span className="text-lg font-semibold text-green-900">
            {formatVnd(minPrice)}
            {hasRange ? ` – ${formatVnd(maxPrice)}` : ""}
            {product.unit ? ` / ${product.unit}` : ""}
          </span>
        </div>
        {product.variants.length > 1 ? (
          <div className="mt-3">
            <p className="text-sm font-medium text-green-900">Biến thể</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <li
                  key={String(v.id)}
                  className="rounded border border-green-200 bg-white px-3 py-1.5 text-sm text-green-900"
                >
                  {v.name} – {formatVnd(v.unitPrice)}
                  {v.stock > 0 ? (
                    <span className="ml-1 text-green-600">({v.stock} có sẵn)</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {product.sellerId ? (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/50 p-3">
            <UserAvatar userId={product.sellerId} size="md" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                {getUserById(product.sellerId)?.displayName ?? "Người bán"}
              </p>
              <Link
                href={`/u/${product.sellerId}`}
                className="text-sm text-green-700 hover:underline"
              >
                Xem hồ sơ →
              </Link>
            </div>
          </div>
        ) : null}
        <ProductDetailActions
          productId={product.id}
          sellerId={product.sellerId ?? undefined}
          defaultVariantId={product.variants[0].id}
        />
        {product.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-green-100 px-2 py-0.5 text-sm text-green-800"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <ProductReviewsSection
        productId={product.id}
        onReviewAdded={() => {
          getProductById(product.id).then((p) => p && setProduct(p));
        }}
      />
    </div>
  );
}
