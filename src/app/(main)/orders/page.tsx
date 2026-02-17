"use client";

/**
 * My orders - placeholder for Step 5
 * TEST: /orders - requires login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import { AuthGuard } from "@/features/auth/AuthGuard";

function OrdersContent() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900">My Orders</h1>
      <p className="mt-4 text-green-900/70">You have no orders yet.</p>
      <Link href="/shop" className="mt-4 inline-block text-sm text-green-700 hover:underline">
        Browse shop
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/auth/login?next=/orders");
    }
  }, [user, router]);

  if (!user) return null;

  return <OrdersContent />;
}
