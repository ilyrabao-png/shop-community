"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/store/useAuth";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItemQty,
  removeCartItem,
} from "@/services/api";
import type { CartItem, ProductId, VariantId } from "@/types/models";

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  addItem: (productId: ProductId, variantId: VariantId, quantity?: number) => Promise<void>;
  removeItem: (productId: ProductId, variantId: VariantId) => Promise<void>;
  updateQty: (productId: ProductId, variantId: VariantId, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    getCart(user.id).then(setItems);
  }, [user?.id]);

  const addItem = useCallback(
    async (productId: ProductId, variantId: VariantId, quantity = 1) => {
      if (!user) return;
      const next = await apiAddToCart({
        userId: user.id,
        productId,
        variantId,
        quantity,
      });
      setItems(next);
    },
    [user?.id]
  );

  const removeItem = useCallback(
    async (productId: ProductId, variantId: VariantId) => {
      if (!user) return;
      const item = items.find(
        (i) =>
          String(i.productId) === String(productId) &&
          String(i.variantId) === String(variantId)
      );
      if (!item) return;
      const next = await removeCartItem({ userId: user.id, itemId: item.id });
      setItems(next);
    },
    [user?.id, items]
  );

  const updateQty = useCallback(
    async (productId: ProductId, variantId: VariantId, quantity: number) => {
      if (!user) return;
      const item = items.find(
        (i) =>
          String(i.productId) === String(productId) &&
          String(i.variantId) === String(variantId)
      );
      if (!item) return;
      if (quantity < 1) {
        const next = await removeCartItem({ userId: user.id, itemId: item.id });
        setItems(next);
        return;
      }
      const next = await updateCartItemQty({
        userId: user.id,
        itemId: item.id,
        quantity,
      });
      setItems(next);
    },
    [user?.id, items]
  );

  const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const value: CartContextValue = {
    items,
    totalCount,
    addItem,
    removeItem,
    updateQty,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
