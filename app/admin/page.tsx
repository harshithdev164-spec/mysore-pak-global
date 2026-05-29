"use client";

import Link from "next/link";
import { useAdminFetch } from "@/lib/useAdminFetch";

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface TopProduct { name: string; qty: number; revenue: number; }

interface Stats {
  orderCount: number;
  totalRevenue: number;
  productCount: number;
  categoryCount: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
          <div className="h-2 bg-gray-100 rounded w-2/3 mb-3" />
          <div className="h-7 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, loading, error } = useAdminFetch<Stats>("/api/admin/stats");

  const statCards = [
    { label: "Total Orders", value: stats?.orderCount, color: "text-gray-900" },
    { label: "Revenue (excl. cancelled)", value: `₹${(stats?.totalRevenue ?? 0).toFixed(0)}`, color: "text-amber-700" },
    { label: "Active Products", value: stats?.productCount, color: "text-gray-900" },
    { label: "Categories", value: stats?.categoryCount, color: "text-gray-900" },
  ];

  const maxQty = stats?.topProducts?.[0]?.qty ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-700 font-medium mb-1">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm font-mono">{error}</p>
        </div>
      ) : loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">{card.label}</div>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value ?? "—"}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { href: "/admin/orders", label: "Manage Orders", desc: "View and update order statuses" },
          { href: "/admin/products/new", label: "Add Product", desc: "Create a new product listing" },
          { href: "/admin/categories", label: "Manage Categories", desc: "Edit product categories" },
          { href: "/admin/explore", label: "Manage Discovery", desc: "Upload images for tour guide" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors mb-1">{link.label}</div>
            <div className="text-xs text-gray-400">{link.desc}</div>
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="flex-1 h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
              ))}
            </div>
          ) : stats?.recentOrders?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 font-medium text-gray-500">Order</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Total</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-amber-600 hover:underline font-medium">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-700 max-w-[110px] truncate">{order.customer_name}</td>
                    <td className="py-3 font-semibold">₹{order.total}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-sm py-6 text-center">No orders yet.</p>
          )}
        </div>

        {/* Top Ordered Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Most Ordered Products</h2>
            <span className="text-xs text-gray-400">by units sold</span>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : stats?.topProducts?.length ? (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <span className="text-sm text-gray-800 truncate">{p.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-sm font-semibold text-gray-900">{p.qty} units</span>
                      <span className="text-xs text-gray-400 ml-2">₹{p.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-6 text-center">No order data yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
