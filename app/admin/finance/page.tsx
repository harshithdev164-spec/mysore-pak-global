"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const dynamic = "force-dynamic";

type Preset = "today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month" | "custom";
type Status = "all" | "paid" | "pending" | "refunded";

interface ApiResponse {
  range: { from: string; to: string };
  gst_rate_pct: number;
  filter: { preset: Preset; status: Status };
  kpis: {
    total_orders: number; total_revenue: number; total_subtotal: number;
    total_discount: number; total_shipping: number; total_gst: number;
    total_cgst: number; total_sgst: number; total_igst: number;
    refunded_amount: number; refunded_orders: number;
    net_revenue: number; avg_order_value: number;
  };
  gst_summary: { tax_type: string; taxable_value: number; gst_amount: number }[];
  state_report: { state: string; orders: number; revenue: number; gst: number }[];
  product_report: { product: string; qty: number; revenue: number }[];
  payment_report: { method: string; orders: number; revenue: number }[];
  daily_trend: { date: string; orders: number; revenue: number; gst: number }[];
  invoices: {
    order_number: string; customer_name: string; customer_phone: string;
    total: number; payment_status: string; created_at: string;
  }[];
}

const inr = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrFine = (n: number) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const PIE_COLORS = ["#059669", "#0d9488", "#0891b2", "#7c3aed", "#db2777", "#f59e0b", "#dc2626"];

const PRESETS: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "custom", label: "Custom" },
];

const STATUSES: { id: Status; label: string }[] = [
  { id: "all", label: "All orders" },
  { id: "paid", label: "Paid only" },
  { id: "pending", label: "Pending" },
  { id: "refunded", label: "Refunded" },
];

export default function FinancePage() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [status, setStatus] = useState<Status>("paid");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [productSort, setProductSort] = useState<"revenue" | "qty">("revenue");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({ preset, status });
    if (preset === "custom") {
      if (customFrom) params.set("from", customFrom);
      if (customTo) params.set("to", customTo);
    }
    return params.toString();
  }, [preset, status, customFrom, customTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/finance?${query}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setData(j); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);

  const k = data?.kpis;
  const sortedProducts = useMemo(() => {
    if (!data) return [];
    const arr = [...data.product_report];
    if (productSort === "qty") arr.sort((a, b) => b.qty - a.qty);
    else arr.sort((a, b) => b.revenue - a.revenue);
    return arr;
  }, [data, productSort]);

  const filteredInvoices = useMemo(() => {
    if (!data) return [];
    const q = invoiceSearch.trim().toLowerCase();
    if (!q) return data.invoices;
    return data.invoices.filter((i) =>
      i.order_number.toLowerCase().includes(q) ||
      (i.customer_name ?? "").toLowerCase().includes(q) ||
      (i.customer_phone ?? "").toLowerCase().includes(q)
    );
  }, [data, invoiceSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & GST</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live sales + GST reporting from your orders. GST rate applied:{" "}
            <span className="font-semibold text-emerald-700">{data?.gst_rate_pct ?? 18}%</span>{" "}
            {data && (
              <>· Range: <span className="font-mono">{data.range.from}</span> → <span className="font-mono">{data.range.to}</span> (IST)</>
            )}
          </p>
        </div>
        <a
          href={`/api/admin/finance/export?${query}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          📥 Download Excel
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                preset === p.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
            />
            <span className="text-gray-400 text-xs">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg"
            />
          </div>
        )}
        <div className="ml-auto flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                status === s.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi label="Total Sales" value={inr(k?.total_revenue ?? 0)} sub={`${k?.total_orders ?? 0} orders`} loading={loading} />
        <Kpi label="Net Revenue" value={inr(k?.net_revenue ?? 0)} sub="Gross − refunds" loading={loading} accent="emerald" />
        <Kpi label="Avg Order Value" value={inr(k?.avg_order_value ?? 0)} sub="Per order" loading={loading} />
        <Kpi label="GST Collected" value={inr(k?.total_gst ?? 0)} sub={`CGST + SGST + IGST`} loading={loading} />
        <Kpi label="Refunds" value={inr(k?.refunded_amount ?? 0)} sub={`${k?.refunded_orders ?? 0} orders`} loading={loading} accent="rose" />
        <Kpi label="Discounts" value={inr(k?.total_discount ?? 0)} sub="Coupons + offers" loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Daily revenue trend</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data?.daily_trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  formatter={(v: number) => inrFine(v)}
                  contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="gst" stroke="#0891b2" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment method mix</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data?.payment_report ?? []}
                  dataKey="revenue"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={(e: { method: string }) => e.method.slice(0, 14)}
                  labelLine={false}
                >
                  {(data?.payment_report ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => inrFine(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* GST + State + Payment tables */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="GST Summary">
          <Table
            head={["Tax Type", "Taxable (₹)", "GST (₹)"]}
            rows={(data?.gst_summary ?? []).map((r) => [
              <span key="t" className={r.tax_type === "Total GST" ? "font-bold text-emerald-700" : ""}>
                {r.tax_type}
              </span>,
              inrFine(r.taxable_value),
              <span key="g" className={r.tax_type === "Total GST" ? "font-bold" : ""}>
                {inrFine(r.gst_amount)}
              </span>,
            ])}
          />
        </Card>

        <Card title="State-wise Sales">
          <Table
            head={["State", "Orders", "Revenue (₹)", "GST (₹)"]}
            rows={(data?.state_report ?? []).slice(0, 15).map((r) => [
              r.state, r.orders, inrFine(r.revenue), inrFine(r.gst),
            ])}
          />
        </Card>

        <Card title="Payment Method Breakdown">
          <Table
            head={["Method", "Orders", "Revenue (₹)"]}
            rows={(data?.payment_report ?? []).map((r) => [
              r.method, r.orders, inrFine(r.revenue),
            ])}
          />
        </Card>
      </div>

      {/* Product report */}
      <Card
        title="Product-wise Sales"
        extra={
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setProductSort("revenue")}
              className={`px-2 py-1 rounded ${productSort === "revenue" ? "bg-emerald-100 text-emerald-700 font-semibold" : "text-gray-500"}`}
            >Sort: Revenue</button>
            <button
              onClick={() => setProductSort("qty")}
              className={`px-2 py-1 rounded ${productSort === "qty" ? "bg-emerald-100 text-emerald-700 font-semibold" : "text-gray-500"}`}
            >Sort: Qty</button>
          </div>
        }
      >
        <div className="grid lg:grid-cols-2 gap-4">
          <Table
            head={["Product", "Qty", "Revenue (₹)"]}
            rows={sortedProducts.slice(0, 25).map((r) => [r.product, r.qty, inrFine(r.revenue)])}
          />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={sortedProducts.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="product" stroke="#6b7280" fontSize={9} angle={-30} textAnchor="end" interval={0} height={70} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip formatter={(v: number) => inrFine(v)} />
                <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Invoice search */}
      <Card
        title="Invoices (latest 200)"
        extra={
          <input
            type="search"
            placeholder="Search by order #, name, or mobile..."
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg w-64"
          />
        }
      >
        <Table
          head={["Order #", "Date (IST)", "Customer", "Mobile", "Total (₹)", "Status"]}
          rows={filteredInvoices.slice(0, 50).map((i) => {
            const ist = new Date(new Date(i.created_at).getTime() + 5.5 * 60 * 60 * 1000)
              .toISOString().slice(0, 16).replace("T", " ");
            return [
              <span key="o" className="font-mono text-xs">#{i.order_number}</span>,
              <span key="d" className="text-xs">{ist}</span>,
              i.customer_name,
              <span key="p" className="font-mono text-xs">{i.customer_phone}</span>,
              inrFine(i.total),
              <span key="s" className={`text-xs px-2 py-0.5 rounded-full ${
                i.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" :
                i.payment_status === "refunded" ? "bg-rose-100 text-rose-700" :
                i.payment_status === "pending" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-700"
              }`}>{i.payment_status}</span>,
            ];
          })}
        />
        <p className="text-xs text-gray-400 mt-2">
          Showing {Math.min(filteredInvoices.length, 50)} of {filteredInvoices.length} invoice{filteredInvoices.length === 1 ? "" : "s"} in range. Download Excel for full list.
        </p>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────
// Presentational components
// ──────────────────────────────────────────────

function Kpi({
  label, value, sub, loading, accent,
}: { label: string; value: string; sub?: string; loading?: boolean; accent?: "emerald" | "rose" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className={`text-lg sm:text-xl font-bold mt-1 truncate ${
        accent === "emerald" ? "text-emerald-700" :
        accent === "rose" ? "text-rose-600" :
        "text-gray-900"
      }`}>
        {loading ? <span className="inline-block w-20 h-5 bg-gray-100 rounded animate-pulse" /> : value}
      </div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({
  title, extra, children,
}: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

function Table({
  head, rows,
}: { head: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) {
    return <p className="text-xs text-gray-400 py-6 text-center">No data in this range.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {head.map((h, i) => (
              <th key={i} className="px-2 py-2 text-left text-[10px] uppercase tracking-wider font-bold text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              {r.map((c, j) => (
                <td key={j} className="px-2 py-2 text-gray-700">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
