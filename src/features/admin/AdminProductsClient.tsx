"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Badge, Input } from "@/components/ui";
import { Modal } from "@/components/ui";
import {
  adminListProducts,
  adminUpdateProduct,
  adminListUsers,
  getTagSuggestions,
} from "@/services/api";
import type { Product, ContentStatus } from "@/types/models";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}

export function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const { tags, categories } = getTagSuggestions();

  function load() {
    setProducts(
      adminListProducts({
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      })
    );
  }

  useEffect(load, [categoryFilter, statusFilter]);

  function openEdit(p: Product) {
    setEditProduct(p);
    setEditName(p.name);
    setEditCategory(p.category ?? "");
    setEditTags((p.tags ?? []).join(", "));
  }

  function handleSaveEdit() {
    if (!editProduct) return;
    adminUpdateProduct(editProduct.id, {
      name: editName,
      category: editCategory || undefined,
      tags: editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setEditProduct(null);
    load();
  }

  function handleToggleHidden(p: Product) {
    const s = (p.status ?? "active") as ContentStatus;
    adminUpdateProduct(p.id, {
      status: s === "hidden" ? "active" : "hidden",
    });
    load();
  }

  function handleSoftDelete(p: Product) {
    adminUpdateProduct(p.id, { status: "deleted" });
    load();
  }

  const users = adminListUsers({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-900">Quản lý sản phẩm</h1>
      <div className="flex flex-wrap gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter((e.target.value || "") as ContentStatus | "")
          }
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hiển thị</option>
          <option value="hidden">Ẩn</option>
          <option value="deleted">Đã xóa</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-200 bg-green-50/50">
              <th className="px-4 py-3 text-left font-medium text-green-900">Ảnh</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Tên</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Danh mục</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Người bán</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Giá</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Đánh giá</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const minP = Math.min(...p.variants.map((v) => v.unitPrice));
              const maxP = Math.max(...p.variants.map((v) => v.unitPrice));
              const seller = users.find((u) => u.id === p.sellerId);
              return (
                <tr key={p.id} className="border-b border-green-100">
                  <td className="px-4 py-3">
                    {p.imageUrls?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.imageUrls[0]}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-green-100 text-lg">
                        🌱
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-900">{p.name}</td>
                  <td className="px-4 py-3 text-green-900/70">{p.category ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/u/${p.sellerId}`}
                      className="text-green-700 hover:underline"
                    >
                      {seller?.displayName ?? p.sellerId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {minP === maxP
                      ? formatVnd(minP)
                      : `${formatVnd(minP)} – ${formatVnd(maxP)}`}
                  </td>
                  <td className="px-4 py-3">
                    {p.avgRating ?? 0}★ ({p.reviewCount ?? 0})
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        (p.status ?? "active") === "active"
                          ? "bg-green-100 text-green-700"
                          : (p.status ?? "active") === "hidden"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {p.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link href={`/shop/${p.id}`}>
                        <Button variant="ghost" className="text-xs">
                          Xem
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => openEdit(p)}
                      >
                        Sửa
                      </Button>
                      {(p.status ?? "active") !== "deleted" ? (
                        <>
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => handleToggleHidden(p)}
                          >
                            {(p.status ?? "active") === "hidden" ? "Hiện" : "Ẩn"}
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-xs text-amber-700"
                            onClick={() => handleSoftDelete(p)}
                          >
                            Xóa
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Sửa sản phẩm"
      >
        {editProduct ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-900">Tên</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 border-green-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-900">Danh mục</label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Hoặc chọn: "
                className="mt-1 border-green-200"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                {categories.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditCategory(c)}
                    className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-900">Tags</label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2"
                className="mt-1 border-green-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditProduct(null)}>
                Hủy
              </Button>
              <Button className="bg-green-700" onClick={handleSaveEdit}>
                Lưu
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
