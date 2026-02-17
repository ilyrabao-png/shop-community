"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/useAuth";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { createProductForSeller, getAdminSettings } from "@/services/api";
import { SHOP_CATEGORIES } from "@/features/shop/categories";

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "box", label: "hộp" },
  { value: "bag", label: "bao" },
  { value: "item", label: "cái" },
] as const;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const [listingDisabled, setListingDisabled] = useState(false);

  useEffect(() => {
    setListingDisabled(!getAdminSettings().enableNewProductListing);
  }, []);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login?next=/sell");
      return;
    }
  }, [user, router]);

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Promise.all(Array.from(files).map(fileToDataUrl)).then((urls) => {
      setImageUrls((prev) => [...prev, ...urls].slice(0, 10));
    });
  }, []);

  function removeImage(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setMessage(null);
    const price = parseInt(unitPrice, 10);
    const stockNum = parseInt(stock, 10);
    if (!name.trim()) {
      setMessage("error");
      return;
    }
    if (isNaN(price) || price < 0) {
      setMessage("error");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setMessage("error");
      return;
    }
    if (!category) {
      setMessage("error");
      return;
    }
    setLoading(true);
    try {
      await createProductForSeller({
        userId: user.id,
        name: name.trim(),
        description: description.trim(),
        imageUrls,
        category,
        tags,
        unit,
        unitPrice: price,
        stock: stockNum,
      });
      setMessage("success");
      setName("");
      setDescription("");
      setCategory("");
      setUnitPrice("");
      setStock("");
      setTags([]);
      setImageUrls([]);
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1500);
    } catch {
      setMessage("error");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  if (listingDisabled) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-green-900">Đăng bán sản phẩm</h1>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Đăng bán sản phẩm mới đang tạm khóa.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-green-900">Đăng bán sản phẩm</h1>
      <p className="mt-1 text-sm text-green-900/70">
        Điền thông tin sản phẩm. Ảnh lưu tạm trên trình duyệt (MVP).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {message === "success" ? (
          <div role="alert" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Đã đăng bán. Đang chuyển đến hồ sơ…
          </div>
        ) : message === "error" ? (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Vui lòng kiểm tra lại các trường bắt buộc (tên, giá, số lượng, danh mục).
          </div>
        ) : null}

        <div>
          <label htmlFor="sell-name" className="mb-1 block text-sm font-medium text-green-900">
            Tên sản phẩm *
          </label>
          <Input
            id="sell-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Cam sành Đồng Tháp"
            className="border-green-200 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="sell-desc" className="mb-1 block text-sm font-medium text-green-900">
            Mô tả
          </label>
          <textarea
            id="sell-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về sản phẩm"
            className="w-full rounded-lg border border-green-200 px-3 py-2 text-sm placeholder:text-green-900/40 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="sell-category" className="mb-1 block text-sm font-medium text-green-900">
            Danh mục *
          </label>
          <select
            id="sell-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
            disabled={loading}
          >
            <option value="">Chọn danh mục</option>
            {SHOP_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sell-price" className="mb-1 block text-sm font-medium text-green-900">
              Giá (VNĐ) *
            </label>
            <Input
              id="sell-price"
              type="number"
              min={0}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="50000"
              className="border-green-200 focus:ring-green-700/40"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="sell-unit" className="mb-1 block text-sm font-medium text-green-900">
              Đơn vị
            </label>
            <select
              id="sell-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
              disabled={loading}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="sell-stock" className="mb-1 block text-sm font-medium text-green-900">
            Số lượng *
          </label>
          <Input
            id="sell-stock"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="10"
            className="border-green-200 focus:ring-green-700/40"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-green-900">
            Thẻ (tags)
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="rounded hover:bg-green-200"
                  aria-label={`Xóa ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
            {tags.length < 10 ? (
              <span className="inline-flex gap-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Thêm tag"
                  className="w-28 border-green-200 py-1 text-sm focus:ring-green-700/40"
                  disabled={loading}
                />
                <Button type="button" variant="secondary" onClick={addTag} disabled={loading}>
                  Thêm
                </Button>
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-green-900">
            Ảnh (tối đa 10)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-green-900/70 file:mr-2 file:rounded file:border-0 file:bg-green-100 file:px-3 file:py-1 file:text-green-800"
            disabled={loading || imageUrls.length >= 10}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-green-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80"
                  aria-label="Xóa ảnh"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="bg-green-700 hover:bg-green-800 focus:ring-green-700/40"
            disabled={loading}
          >
            {loading ? "Đang đăng…" : "Đăng bán"}
          </Button>
          <Link href="/profile">
            <Button type="button" variant="secondary">
              Hủy
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
