"use client";

/**
 * TEST: /cart
 * - shows items (image, name, price, quantity)
 * - quantity controls (+ / -)
 * - remove button
 * - subtotal updates
 * - Click cart icon in header to open
 */

import Link from "next/link";
import { useCart } from "@/store/cart";
import { getProductById } from "@/services/api";
import type { ProductId } from "@/types/models";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import type { Product } from "@/types/models";

function formatVnd(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    const ids = [...new Set(items.map((i) => String(i.productId)))];
    Promise.all(ids.map((id) => getProductById(id as ProductId))).then(
      (results) => {
        const map: Record<string, Product> = {};
        results.forEach((p) => {
          if (p) map[String(p.id)] = p;
        });
        setProducts(map);
      }
    );
  }, [items]);

  const subtotal = items.reduce((acc, item) => {
    const p = products[String(item.productId)];
    if (!p) return acc;
    const v = p.variants.find((x) => String(x.id) === String(item.variantId));
    if (!v) return acc;
    return acc + v.unitPrice * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-green-900">Giỏ hàng</h1>
        <p className="mt-4 text-green-900/70">Giỏ hàng trống.</p>
        <Link href="/shop">
          <Button className="mt-4 bg-green-700 hover:bg-green-800">
            Mua sắm
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-green-900">Giỏ hàng</h1>
      <ul className="mt-6 space-y-4">
        {items.map((item) => {
          const p = products[String(item.productId)];
          const v = p?.variants.find(
            (x) => String(x.id) === String(item.variantId)
          );
          if (!p || !v) return null;
          const img = p.imageUrls?.[0];
          return (
            <li
              key={item.id}
              className="flex gap-4 rounded-xl border border-green-200 bg-white p-4"
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-green-50">
                {img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={img}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🌱
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/shop/${p.id}`}
                  className="font-medium text-green-900 hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-sm text-green-900/70">
                  {v.name} · {formatVnd(v.unitPrice)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(item.productId, item.variantId, item.quantity - 1)
                    }
                    aria-label="Giảm số lượng"
                    className="flex h-7 w-7 items-center justify-center rounded border border-green-200 bg-white text-green-800 hover:bg-green-50"
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(item.productId, item.variantId, item.quantity + 1)
                    }
                    aria-label="Tăng số lượng"
                    className="flex h-7 w-7 items-center justify-center rounded border border-green-200 bg-white text-green-800 hover:bg-green-50"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="ml-2 text-sm text-amber-600 hover:text-amber-800"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-medium text-green-900">
                  {formatVnd(v.unitPrice * item.quantity)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 rounded-xl border border-green-200 bg-white p-4">
        <div className="flex justify-between text-lg font-semibold text-green-900">
          <span>Tạm tính</span>
          <span>{formatVnd(subtotal)}</span>
        </div>
        <Button
          className="mt-4 w-full bg-green-700 hover:bg-green-800"
          disabled
        >
          Thanh toán (stub)
        </Button>
      </div>
      <Link href="/shop" className="mt-4 inline-block text-sm text-green-700 hover:underline">
        ← Tiếp tục mua sắm
      </Link>
    </div>
  );
}
