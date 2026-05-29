"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { COUNTRY_BY_CODE } from "@/lib/countries";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  shipping_address: { country?: string } | null;
  awb_code: string | null;          // tracking number — both Delhivery + DHL write here
  courier_name: string | null;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  pickup: "bg-orange-100 text-orange-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

// Filter tabs.
//   value: "international"      → sent as country=intl filter (not a status)
//   value: comma-separated set  → sent as status= multi-status filter (e.g. "shipped,delivered")
//   otherwise                   → single status filter
const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pickup", value: "pickup" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Fulfilled", value: "shipped,delivered" },
  { label: "🌍 International", value: "international" },
  { label: "Cancelled", value: "cancelled" },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

function exportToCSV(orders: Order[]) {
  const headers = ["Order #", "Customer Name", "Email", "Phone", "Total (₹)", "Status", "Payment Status", "Payment Method", "Date"];
  const rows = orders.map((o) => [
    o.order_number, o.customer_name, o.customer_email, o.customer_phone,
    o.total, o.status, o.payment_status, o.payment_method ?? "",
    new Date(o.created_at).toLocaleDateString("en-IN"),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    page_size: 50,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce search input → actual query (300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(pageSize),
        });
        if (statusFilter === "international") {
          params.set("country", "intl");
        } else if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.error) {
          setError(json.error);
        } else {
          setOrders(json.data ?? []);
          if (json.pagination) setPagination(json.pagination);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, statusFilter, search]
  );

  // Fetch whenever page / size / filter / search changes
  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Auto-refresh every 10 seconds (silent background refresh for near real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Trigger Delhivery + DHL tracking sync periodically so pickup → shipped → delivered
  // transitions propagate automatically. Runs on mount + every 2 minutes.
  useEffect(() => {
    let cancelled = false;
    const runSync = async () => {
      try {
        const results = await Promise.all([
          fetch("/api/admin/delhivery/sync", { method: "POST", cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
          fetch("/api/admin/dhl/sync", { method: "POST", cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
        ]);
        const totalUpdated = results.reduce((sum, j) => sum + (j?.updated ?? 0), 0);
        if (!cancelled && totalUpdated > 0) fetchOrders(true);
      } catch {
        // ignore — surfaced via per-order admin sync button if needed
      }
    };
    runSync();
    const interval = setInterval(runSync, 120000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchOrders]);

  // Reset to page 1 when filter, page size, or search changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, pageSize, search]);

  const rangeStart = orders.length === 0 ? 0 : (pagination.page - 1) * pagination.page_size + 1;
  const rangeEnd = (pagination.page - 1) * pagination.page_size + orders.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {pagination.total > 0
              ? `${rangeStart}–${rangeEnd} of ${pagination.total}`
              : `${pagination.total} orders`}
          </span>
          <button
            onClick={() => fetchOrders(false)}
            disabled={loading}
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>↻</span> Refresh
          </button>
          <button
            onClick={() => exportToCSV(orders)}
            disabled={orders.length === 0}
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>↓</span> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 3.473 9.78l3.124 3.123a.75.75 0 1 0 1.06-1.06l-3.123-3.124A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, name, email, or phone…"
              className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatusFilter(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === t.value
                  ? t.label === "Fulfilled"
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-16" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8">
            <p className="text-red-600 font-medium text-sm">Error loading orders</p>
            <p className="text-red-400 text-xs font-mono mt-1">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Payment</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tracking</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {(() => {
                        const country = order.shipping_address?.country ?? "IN";
                        const isIntl = country !== "IN";
                        return (
                          <Link href={`/admin/orders/${order.id}`} className="text-amber-600 hover:underline font-medium inline-flex items-center gap-1.5">
                            <span title={country}>
                              {isIntl ? COUNTRY_BY_CODE[country]?.flag ?? "🌍" : "🇮🇳"}
                            </span>
                            {order.order_number}
                          </Link>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-400">{order.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{order.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PAYMENT_COLORS[order.payment_status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        // awb_code is the universal tracking field — both Delhivery (domestic)
                        // and DHL (international) write to it on shipment creation.
                        // delhivery_waybill is a legacy fallback for older orders.
                        const trackingNum = order.awb_code;
                        if (!trackingNum) {
                          return <span className="text-gray-300">—</span>;
                        }
                        const country = order.shipping_address?.country ?? "IN";
                        const isIntl = country !== "IN";
                        const url = isIntl
                          ? `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNum}`
                          : `https://www.delhivery.com/tracking?id=${trackingNum}`;
                        const courier = isIntl ? "DHL Express" : (order.courier_name ?? "Delhivery");
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Track on ${courier}`}
                            className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:underline"
                          >
                            <span aria-hidden="true">↗</span>
                            {trackingNum}
                          </a>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-blue-600 hover:underline">View →</Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={pagination.page === 1}
                className="px-2 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="First page"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-600 px-2">
                Page <span className="font-medium text-gray-900">{pagination.page}</span> of{" "}
                <span className="font-medium text-gray-900">{pagination.total_pages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={pagination.page >= pagination.total_pages}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
              <button
                onClick={() => setPage(pagination.total_pages)}
                disabled={pagination.page >= pagination.total_pages}
                className="px-2 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Last page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
