"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface Stats {
  orderCount: number;
  totalRevenue: number;
  productCount: number;
  categoryCount: number;
  recentOrders: RecentOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setError(j.error);
        else setStats(j.data);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium mb-1">Failed to load dashboard data</p>
          <p className="text-red-500 text-sm font-mono">{error}</p>
          <p className="text-gray-500 text-xs mt-3">
            Make sure <code className="bg-gray-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is set in <code className="bg-gray-100 px-1 rounded">.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Orders", value: stats?.orderCount, color: "text-gray-900" },
    { label: "Revenue (excl. cancelled)", value: `₹${(stats?.totalRevenue ?? 0).toFixed(0)}`, color: "text-amber-700" },
    { label: "Active Products", value: stats?.productCount, color: "text-gray-900" },
    { label: "Categories", value: stats?.categoryCount, color: "text-gray-900" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { href: "/admin/orders", label: "Manage Orders", desc: "View and update order statuses" },
          { href: "/admin/products/new", label: "Add Product", desc: "Create a new product listing" },
          { href: "/admin/categories", label: "Manage Categories", desc: "Edit product categories" },
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

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 transition-colors">
            View all →
          </Link>
        </div>

        {stats?.recentOrders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 font-medium text-gray-500">Order</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Total</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-amber-600 hover:underline font-medium"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-700">{order.customer_name}</td>
                    <td className="py-3 font-semibold">₹{order.total}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-6 text-center">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
