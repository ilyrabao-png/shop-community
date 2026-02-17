/**
 * TEST: /shop/<someProductId>
 * - add to cart, detail, gallery, stars, reviews, review form
 * - Review product owned by currentUser => notification for seller
 */

import { ProductDetailClient } from "@/features/shop/ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
