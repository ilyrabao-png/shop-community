"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPost, getSuggestionsWithProductIds, type SuggestionItem } from "@/services/api";
import { useAuth } from "@/store/useAuth";
import type { ProductId } from "@/types/models";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function PostComposer() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Array<{ label: string; productIds: ProductId[] }>>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(getSuggestionsWithProductIds());
  }, []);

  const filtered =
    input.trim().length < 2
      ? []
      : suggestions.filter(
          (s) =>
            s.value.toLowerCase().includes(input.toLowerCase()) &&
            !selected.some((x) => x.label.toLowerCase() === s.value.toLowerCase())
        );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function addSuggestion(item: SuggestionItem) {
    if (selected.some((x) => x.label === item.value)) return;
    setSelected((prev) => [...prev, { label: item.value, productIds: item.productIds }]);
    setInput("");
    setOpen(false);
  }

  function removeSelected(label: string) {
    setSelected((prev) => prev.filter((x) => x.label !== label));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    Promise.all(Array.from(files).map(fileToDataUrl)).then((urls) => {
      setImageUrls((prev) => [...prev, ...urls].slice(0, 10));
    });
  }

  function removeImage(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setSubmitting(true);
    try {
      const productIds = Array.from(
        new Set(selected.flatMap((s) => s.productIds.map(String)))
      ) as ProductId[];
      await createPost({
        userId: user.id,
        content: content.trim(),
        imageUrls: imageUrls.length ? imageUrls : undefined,
        productIds: productIds.length ? productIds : undefined,
      });
      router.push("/feed?r=" + Date.now());
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <p className="mt-4 text-green-900/70">
        <Link href="/auth/login" className="text-green-700 hover:underline">
          Đăng nhập
        </Link>{" "}
        để tạo bài đăng.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="post-content" className="block text-sm font-medium text-green-900">
          Nội dung
        </label>
        <textarea
          id="post-content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-700/40"
          placeholder="Viết gì đó..."
          required
          disabled={submitting}
        />
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
          disabled={submitting || imageUrls.length >= 10}
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
      <div ref={wrapperRef} className="relative">
        <label className="block text-sm font-medium text-green-900">
          Gắn thẻ (tags/categories từ sản phẩm)
        </label>
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Gõ để tìm (ví dụ: casual, Apparel)..."
          className="mt-1 border-green-200"
          disabled={submitting}
        />
        {open && filtered.length > 0 ? (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-green-200 bg-white py-1 shadow">
            {filtered.map((item) => (
              <li key={`${item.type}-${item.value}`}>
                <button
                  type="button"
                  onClick={() => addSuggestion(item)}
                  className="w-full px-3 py-2 text-left text-sm text-green-900 hover:bg-green-50"
                >
                  {item.type === "category" ? "📁 " : "🏷️ "}
                  {item.value}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {selected.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800"
              >
                {s.label}
                <button
                  type="button"
                  onClick={() => removeSelected(s.label)}
                  className="rounded hover:bg-green-200"
                  aria-label={`Xóa ${s.label}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="bg-green-700">
          {submitting ? "Đang đăng…" : "Đăng bài"}
        </Button>
        <Link href="/feed">
          <Button type="button" variant="secondary">
            Hủy
          </Button>
        </Link>
      </div>
    </form>
  );
}
