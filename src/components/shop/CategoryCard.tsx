import Link from "next/link";
import type { ShopCategory } from "@/features/shop/categories";

export interface CategoryCardProps {
  category: ShopCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const href = `/shop?category=${category.slug}`;

  return (
    <article className="flex flex-col rounded-xl border border-green-200/60 bg-white p-4 shadow-sm transition hover:border-green-300 hover:shadow-md">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-2xl">
        {category.icon}
      </div>
      <h2 className="font-semibold text-green-900">{category.name}</h2>
      <p className="mt-1 text-sm text-green-900/70 line-clamp-2">
        {category.description}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
      >
        Xem sản phẩm
      </Link>
    </article>
  );
}
