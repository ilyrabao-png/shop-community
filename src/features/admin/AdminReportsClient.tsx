"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import { Modal } from "@/components/ui";
import {
  adminListReports,
  adminUpdateReport,
  adminListUsers,
} from "@/services/api";
import type { Report, ReportStatus } from "@/types/models";

function getTargetLink(r: Report): { href: string; label: string } {
  switch (r.type) {
    case "product":
      return { href: `/shop/${r.targetId}`, label: "Sản phẩm" };
    case "post":
      return { href: `/feed/${r.targetId}`, label: "Bài viết" };
    case "comment":
      return { href: "/feed", label: "Bình luận" };
    case "review":
      return { href: "/shop", label: "Đánh giá" };
    case "user":
      return { href: `/u/${r.targetId}`, label: "Người dùng" };
    default:
      return { href: "/", label: r.type };
  }
}

export function AdminReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [resolveModal, setResolveModal] = useState<Report | null>(null);
  const [note, setNote] = useState("");
  const [hideTarget, setHideTarget] = useState(false);

  function load() {
    setReports(
      adminListReports({
        status: statusFilter || undefined,
      })
    );
  }

  useEffect(load, [statusFilter]);

  function openResolve(r: Report) {
    setResolveModal(r);
    setNote("");
    setHideTarget(false);
  }

  function handleResolve() {
    if (!resolveModal) return;
    adminUpdateReport(resolveModal.id, {
      status: "resolved",
      resolutionNote: note,
      hideTarget,
    });
    setResolveModal(null);
    load();
  }

  function handleDismiss() {
    if (!resolveModal) return;
    adminUpdateReport(resolveModal.id, {
      status: "dismissed",
      resolutionNote: note,
    });
    setResolveModal(null);
    load();
  }

  const users = adminListUsers({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-green-900">Báo cáo / Moderation</h1>
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter((e.target.value || "") as ReportStatus | "")
          }
          className="rounded-lg border border-green-200 px-3 py-2 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="open">Chờ xử lý</option>
          <option value="resolved">Đã xử lý</option>
          <option value="dismissed">Đã bỏ qua</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green-200 bg-green-50/50">
              <th className="px-4 py-3 text-left font-medium text-green-900">Loại</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Lý do</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Người báo</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Ngày</th>
              <th className="px-4 py-3 text-left font-medium text-green-900">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const link = getTargetLink(r);
              const reporter = users.find((u) => u.id === r.reporterId);
              return (
                <tr key={r.id} className="border-b border-green-100">
                  <td className="px-4 py-3">
                    <Link href={link.href} className="text-green-700 hover:underline">
                      {link.label} #{r.targetId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-green-900">{r.reason}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/u/${r.reporterId}`}
                      className="text-green-700 hover:underline"
                    >
                      {reporter?.displayName ?? r.reporterId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        r.status === "open"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-green-900/60">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "open" ? (
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => openResolve(r)}
                      >
                        Xử lý
                      </Button>
                    ) : (
                      <span className="text-green-900/50">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal
        open={!!resolveModal}
        onClose={() => setResolveModal(null)}
        title="Xử lý báo cáo"
      >
        {resolveModal ? (
          <div className="space-y-4">
            <p className="text-sm text-green-900">{resolveModal.reason}</p>
            <div>
              <label className="block text-sm font-medium text-green-900">
                Ghi chú xử lý
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hideTarget}
                onChange={(e) => setHideTarget(e.target.checked)}
              />
              <span className="text-sm">Ẩn nội dung khi resolve</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setResolveModal(null)}>
                Hủy
              </Button>
              <Button
                variant="secondary"
                className="text-amber-700"
                onClick={handleDismiss}
              >
                Bỏ qua
              </Button>
              <Button className="bg-green-700" onClick={handleResolve}>
                Xử lý
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
