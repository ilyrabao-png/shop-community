"use client";

import { useEffect, useState } from "react";
import {
  adminListUsers,
  adminListProducts,
  adminListPosts,
  adminListReviews,
  adminListReports,
  getRecentActivity,
} from "@/services/api";
import { Card, CardBody, Badge } from "@/components/ui";
import Link from "next/link";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN");
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState(0);
  const [products, setProducts] = useState(0);
  const [posts, setPosts] = useState(0);
  const [reviews, setReviews] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [activity, setActivity] = useState<
    Array<{ type: string; id: string; label: string; createdAt: string }>
  >([]);

  useEffect(() => {
    setUsers(adminListUsers({}).length);
    setProducts(adminListProducts({}).length);
    setPosts(adminListPosts({}).length);
    setReviews(adminListReviews({}).length);
    setReportCount(adminListReports({ status: "open" }).length);
    setActivity(getRecentActivity(10));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardBody>
            <p className="text-sm text-green-900/70">Tổng người dùng</p>
            <p className="mt-1 text-2xl font-bold text-green-900">{users}</p>
            <Link
              href="/admin/users"
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Xem
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-green-900/70">Sản phẩm</p>
            <p className="mt-1 text-2xl font-bold text-green-900">{products}</p>
            <Link
              href="/admin/products"
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Xem
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-green-900/70">Bài viết</p>
            <p className="mt-1 text-2xl font-bold text-green-900">{posts}</p>
            <Link
              href="/admin/posts"
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Xem
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-green-900/70">Đánh giá</p>
            <p className="mt-1 text-2xl font-bold text-green-900">{reviews}</p>
            <Link
              href="/admin/reviews"
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Xem
            </Link>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-green-900/70">Báo cáo chờ xử lý</p>
            <p className="mt-1 text-2xl font-bold text-green-900">{reportCount}</p>
            <Link
              href="/admin/reports"
              className="mt-2 text-sm text-green-700 hover:underline"
            >
              Xử lý
            </Link>
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-green-900">Hoạt động gần đây</h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-green-900/60">Chưa có hoạt động nào.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {activity.map((a) => (
                <li
                  key={`${a.type}-${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-green-100 px-3 py-2"
                >
                  <span className="text-sm text-green-900">{a.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">{a.type}</Badge>
                    <span className="text-xs text-green-900/50">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
