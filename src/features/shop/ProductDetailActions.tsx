"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/cart";
import { deleteProduct } from "@/services/api";
import type { ProductId, UserId, VariantId } from "@/types/models";
import { Button } from "@/components/ui";

export function ProductDetailActions({
  productId,
  sellerId,
  defaultVariantId,
}: {
  productId: ProductId;
  sellerId?: UserId;
  defaultVariantId: VariantId;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const isOwner = !!sellerId && user?.id === sellerId;

  function handleAddToCart() {
    addItem(productId, defaultVariantId, 1);
  }

  async function handleDelete() {
    if (!user || !isOwner) return;
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await deleteProduct(productId, user.id);
      router.push("/shop");
      router.refresh();
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleAddToCart}
        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/40"
      >
        Thêm vào giỏ
      </button>
      {isOwner ? (
        <Button
          type="button"
          variant="secondary"
          onClick={handleDelete}
          className="text-amber-700 hover:bg-amber-50"
        >
          Xóa sản phẩm
        </Button>
      ) : null}
    </div>
  );
}
