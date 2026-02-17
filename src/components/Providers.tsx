"use client";

import { type ReactNode } from "react";
import { CartProvider } from "@/store/cart";
import { NotificationsProvider } from "@/store/notifications";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </CartProvider>
  );
}
