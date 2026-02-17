export interface ShopCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  /** Featured in Season highlights row */
  featured?: boolean;
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    slug: "fruits",
    name: "Trái cây",
    description: "Trái cây tươi, sạch từ vườn",
    icon: "🍎",
    featured: true,
  },
  {
    slug: "vegetables",
    name: "Rau củ",
    description: "Rau củ organic, an toàn",
    icon: "🥬",
    featured: true,
  },
  {
    slug: "seeds",
    name: "Hạt giống",
    description: "Hạt giống chất lượng cao",
    icon: "🌱",
  },
  {
    slug: "seedlings",
    name: "Cây giống",
    description: "Cây giống khỏe, sẵn sàng trồng",
    icon: "🌿",
  },
  {
    slug: "fertilizers",
    name: "Phân bón",
    description: "Phân bón hữu cơ, hóa học",
    icon: "🌾",
  },
  {
    slug: "bio-pesticides",
    name: "Thuốc sinh học",
    description: "Thuốc trừ sâu sinh học an toàn",
    icon: "🐛",
  },
  {
    slug: "tools",
    name: "Dụng cụ làm nông",
    description: "Cuốc, xẻng, kéo tỉa cành",
    icon: "🔧",
  },
  {
    slug: "mini-machines",
    name: "Máy móc mini",
    description: "Máy bơm, máy cắt cỏ mini",
    icon: "⚙️",
  },
  {
    slug: "soil-substrates",
    name: "Đất/giá thể",
    description: "Đất trồng, giá thể dinh dưỡng",
    icon: "🪴",
  },
  {
    slug: "local-specialties",
    name: "Đặc sản địa phương",
    description: "Đặc sản vùng miền",
    icon: "🏠",
  },
  {
    slug: "seasonal-bundles",
    name: "Combo theo mùa",
    description: "Gói combo nông sản theo mùa",
    icon: "📦",
    featured: true,
  },
];
