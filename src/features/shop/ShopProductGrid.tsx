"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/models";
import { getNewestProducts, listProductsByCategory } from "@/services/api";
import { Card, CardBody, CardImage, Badge, Stars } from "@/components/ui";

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

function ProductCard({ p }: { p: Product }) {
  const minPrice = Math.min(...p.variants.map((v) => v.unitPrice));
  const img = p.imageUrls?.[0];

  return (
    <Link
      href={`/shop/${String(p.id)}`}
      className="block group focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2 rounded-lg"
      aria-label={p.name}
    >
      <Card className="h-full transition hover:shadow-md">
        <CardImage>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={p.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-green-50 text-4xl">
              🌱
            </div>
          )}
        </CardImage>
        <CardBody>
          {p.category ? (
            <Badge className="mb-1 bg-green-100 text-green-700">{p.category}</Badge>
          ) : null}
          <div className="font-semibold text-green-900 truncate" title={p.name}>
            {p.name}
          </div>
          <div className="text-sm text-green-900/70">
            {formatVnd(minPrice)}
            {p.unit ? ` / ${p.unit}` : ""}
          </div>
          <Stars
            rating={p.avgRating ?? 0}
            count={p.reviewCount ?? 0}
            size="sm"
          />
          {p.tags?.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {p.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </CardBody>
      </Card>
    </Link>
  );
}

export function ProductGridNewest() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewestProducts(8)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-green-100/50" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50/50 px-4 py-6 text-center text-sm text-green-900/70">
        Chưa có sản phẩm nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={String(p.id)} p={p} />
      ))}
    </div>
  );
}

export function ProductGridByCategory({ category }: { category: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProductsByCategory(category)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-green-100/50" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50/50 px-4 py-6 text-center text-sm text-green-900/70">
        Chưa có sản phẩm nào trong danh mục này.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={String(p.id)} p={p} />
      ))}
    </div>
  );
}
