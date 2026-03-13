"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_name: string;
  weight_label: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  notes: string | null;
  shipping_address: Record<string, string>;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setOrder(j.data);
          setStatus(j.data.status);
          setPaymentStatus(j.data.payment_status);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!order) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      });
      const json = await res.json();
      if (res.ok) {
        setOrder((prev) => prev ? { ...prev, status: json.data.status, payment_status: json.data.payment_status } : prev);
        setSaveMsg("Saved!");
      } else {
        setSaveMsg(json.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading order...</div>;
  if (!order) return (
    <div>
      <p className="text-red-500">Order not found.</p>
      <Link href="/admin/orders" className="text-sm text-amber-600 hover:underline mt-2 inline-block">← Back to orders</Link>
    </div>
  );

  const addr = order.shipping_address ?? {};

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
          ← Orders
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 font-medium text-gray-500">Product</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Weight</th>
                  <th className="text-center pb-3 font-medium text-gray-500">Qty</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Price</th>
                  <th className="text-right pb-3 font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-gray-900">{item.product_name}</td>
                    <td className="py-3 text-gray-500">{item.weight_label}</td>
                    <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-700">₹{item.unit_price}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">₹{item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span><span>{order.shipping_cost === 0 ? "Free" : `₹${order.shipping_cost}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>−₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="font-medium">{order.customer_name}</div>
              {addr.address && <div>{addr.address}</div>}
              <div>
                {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {saveMsg && (
                <p className={`text-xs text-center ${saveMsg === "Saved!" ? "text-green-600" : "text-red-500"}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            <div className="text-sm space-y-2">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Name</div>
                <div className="text-gray-900 font-medium">{order.customer_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Email</div>
                <div className="text-gray-700">{order.customer_email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Phone</div>
                <div className="text-gray-700">{order.customer_phone}</div>
              </div>
            </div>
          </div>

          {/* Order Meta */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Details</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-900 capitalize">{order.payment_method ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Placed</span>
                <span className="text-gray-900">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="text-gray-900">{new Date(order.updated_at).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
