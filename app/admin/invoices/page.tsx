"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Printer, Calendar, FileText, Search } from "lucide-react";
import { buildInvoice } from "@/lib/invoice-utils";
import { InvoiceTemplate } from "./[orderId]/page";

interface OrderItem {
  product_name: string;
  weight_label?: string;
  quantity: number;
  unit_price: number;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: Record<string, string>;
}

interface OrderFull extends OrderRow {
  items: OrderItem[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function isoNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function BulkInvoicesPage() {
  const [from, setFrom] = useState(isoNDaysAgo(7));
  const [to, setTo] = useState(todayIso());
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState<OrderFull[] | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch all orders in the date range (page_size large; we trust admin UI is gated).
      const params = new URLSearchParams({
        page_size: "500",
        from_date: from,
        to_date: to,
      });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      const filtered: OrderRow[] = (json.data ?? []).filter((o: OrderRow) => {
        const d = o.created_at?.slice(0, 10);
        return d >= from && d <= to;
      });
      setOrders(filtered);
      // Pre-select all by default for convenience
      const sel: Record<string, boolean> = {};
      filtered.forEach((o) => (sel[o.id] = true));
      setSelected(sel);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
  const selectedCount = selectedIds.length;

  const generateBulk = async () => {
    if (selectedCount === 0) return;
    setBulkLoading(true);
    try {
      // Fetch each selected order's full data (with items). API wraps payload in .data.
      const results = await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/orders/${id}`, { cache: "no-store" }).then((r) => r.json())
        )
      );
      const valid = results
        .filter((r) => !r.error && r.data)
        .map((r) => r.data) as OrderFull[];
      setBulkData(valid);
      // Wait for render then print
      setTimeout(() => window.print(), 600);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div>
      {/* Header — hidden during print */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate GST-compliant invoices for any order or in bulk by date range.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order #, name, email…"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Calendar className="w-4 h-4" /> {loading ? "Loading…" : "Apply"}
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {selectedCount} of {orders.length} selected
            </span>
            <button
              onClick={generateBulk}
              disabled={selectedCount === 0 || bulkLoading}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
            >
              {bulkLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              Print {selectedCount > 0 ? `${selectedCount} invoice${selectedCount > 1 ? "s" : ""}` : "selection"}
            </button>
          </div>
        </div>

        {/* Order table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedCount === orders.length}
                    onChange={(e) => {
                      const s: Record<string, boolean> = {};
                      orders.forEach((o) => (s[o.id] = e.target.checked));
                      setSelected(s);
                    }}
                    className="accent-amber-600"
                  />
                </th>
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 inline" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No orders in this date range.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selected[o.id]}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [o.id]: e.target.checked }))
                        }
                        className="accent-amber-600"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-amber-700">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{o.customer_name}</div>
                      <div className="text-xs text-gray-400">{o.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">₹{o.total}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/invoices/${o.id}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk print region — shown only when ready, then auto-printed */}
      {bulkData && bulkData.length > 0 && (
        <div className="mt-6">
          {bulkData.map((order) => {
            const inv = buildInvoice(
              order.items ?? [],
              order.shipping_cost ?? 0,
              order.shipping_address ?? {}
            );
            return (
              <div key={order.id} className="page-break-after-always mb-6">
                <InvoiceTemplate order={order} invoice={inv} />
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .invoice-page { box-shadow: none !important; border: 0 !important; }
          .page-break-after-always { page-break-after: always; }
          .page-break-after-always:last-child { page-break-after: auto; }
        }
      `}</style>
    </div>
  );
}
