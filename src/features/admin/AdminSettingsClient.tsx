"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { getAdminSettings, updateAdminSettings } from "@/services/api";

export function AdminSettingsClient() {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("0");
  const [maxMb, setMaxMb] = useState("2");
  const [enablePost, setEnablePost] = useState(true);
  const [enableProduct, setEnableProduct] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getAdminSettings();
    setName(s.marketplaceName);
    setFee(String(s.feePercentage));
    setMaxMb(String(s.maxUploadSizeMb));
    setEnablePost(s.enableNewPost);
    setEnableProduct(s.enableNewProductListing);
  }, []);

  function handleSave() {
    updateAdminSettings({
      marketplaceName: name.trim() || "B Market",
      feePercentage: Math.max(0, Math.min(100, parseFloat(fee) || 0)),
      maxUploadSizeMb: Math.max(0.5, Math.min(20, parseFloat(maxMb) || 2)),
      enableNewPost: enablePost,
      enableNewProductListing: enableProduct,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Cài đặt Admin</h1>
      <div className="space-y-4 rounded-xl border border-green-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-green-900">
            Tên marketplace
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="B Market"
            className="mt-1 border-green-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-900">
            Phí % (0-100)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="mt-1 border-green-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-900">
            Kích thước upload tối đa (MB)
          </label>
          <Input
            type="number"
            min={0.5}
            max={20}
            step={0.5}
            value={maxMb}
            onChange={(e) => setMaxMb(e.target.value)}
            className="mt-1 border-green-200"
          />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enablePost}
              onChange={(e) => setEnablePost(e.target.checked)}
            />
            <span className="text-sm font-medium text-green-900">
              Cho phép đăng bài mới
            </span>
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enableProduct}
              onChange={(e) => setEnableProduct(e.target.checked)}
            />
            <span className="text-sm font-medium text-green-900">
              Cho phép đăng bán sản phẩm mới
            </span>
          </label>
        </div>
        <Button className="bg-green-700" onClick={handleSave}>
          Lưu cài đặt
        </Button>
        {saved ? (
          <p className="text-sm font-medium text-green-700">Đã lưu.</p>
        ) : null}
      </div>
    </div>
  );
}
