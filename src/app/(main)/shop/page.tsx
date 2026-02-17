/**
 * Shop page – category hub + product grids
 * TEST: /shop - cards with stars (avgRating, reviewCount), category filter; empty: "Chưa có sản phẩm nào"
 */

import { Input } from "@/components/ui";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductGridByCategory, ProductGridNewest } from "@/features/shop/ShopProductGrid";
import { SHOP_CATEGORIES } from "@/features/shop/categories";

const FEATURED = SHOP_CATEGORIES.filter((c) => c.featured);
const REGULAR = SHOP_CATEGORIES.filter((c) => !c.featured);

function CategoryName({ slug }: { slug: string }) {
  const cat = SHOP_CATEGORIES.find((c) => c.slug === slug);
  return <span>{cat?.name ?? slug}</span>;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
    const params = await searchParams;

    const category =
      typeof params.category === "string" ? params.category : undefined;
    
    const q = typeof params.q === "string" ? params.q.trim() : undefined;
    

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-green-900">Cửa hàng</h1>
        <p className="mt-1 text-sm text-green-900/70">
          Chọn danh mục hoặc xem hàng mới đăng
        </p>
      </header>

      <form action="/shop" method="get" className="max-w-xl">
        <label htmlFor="shop-search" className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <Input
          id="shop-search"
          name="q"
          type="search"
          defaultValue={q ?? ""}
          placeholder="Tìm nông sản, hạt giống, dụng cụ…"
          aria-label="Tìm nông sản, hạt giống, dụng cụ"
          className="border-green-200 bg-white placeholder:text-green-900/40 focus:ring-green-700/40"
        />
        {category ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
      </form>

      {category ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-green-900">
            Kết quả: <CategoryName slug={category} />
          </h2>
          <ProductGridByCategory category={category} />
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-green-900">
          Hàng mới đăng
        </h2>
        <ProductGridNewest />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-green-900">
          Nổi bật mùa
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-green-900">
          Danh mục
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {REGULAR.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>
    </div>
  );
}
