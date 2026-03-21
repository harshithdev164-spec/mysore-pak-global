"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminFetch, invalidateCache } from "@/lib/useAdminFetch";

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
  // Shiprocket fields
  shiprocket_order_id: number | null;
  shiprocket_shipment_id: number | null;
  awb_code: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  label_url: string | null;
  invoice_url: string | null;
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
  const { data: order, loading } = useAdminFetch<Order>(`/api/orders/${id}`);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  // Shiprocket action states
  const [srLoading, setSrLoading] = useState<string | null>(null); // which action is running
  const [srMsg, setSrMsg] = useState("");
  const [srData, setSrData] = useState<Partial<Order>>({});

  useEffect(() => {
    if (order && !status) {
      setStatus(order.status);
      setPaymentStatus(order.payment_status);
    }
  }, [order]);

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
        invalidateCache("/api/admin/orders");
        invalidateCache(`/api/orders/${order.id}`);
        router.refresh();
        setSaveMsg("Saved!");
      } else {
        setSaveMsg(json.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function doShiprocketAction(action: string) {
    if (!order) return;
    setSrLoading(action);
    setSrMsg("");
    try {
      const res = await fetch(`/api/admin/shiprocket/${order.id}?action=${action}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");

      setSrMsg(action === "create" ? "Shipment created!" : action === "label" ? "Label ready!" : "Invoice ready!");
      // Merge returned data into local state
      if (json.data) {
        setSrData((prev) => ({
          ...prev,
          shiprocket_order_id: json.data.order_id ?? prev.shiprocket_order_id,
          shiprocket_shipment_id: json.data.shipment_id ?? prev.shiprocket_shipment_id,
          awb_code: json.data.awb_code ?? prev.awb_code,
          courier_name: json.data.courier_name ?? prev.courier_name,
          tracking_url: json.data.tracking_url ?? prev.tracking_url,
        }));
      }
      if (json.label_url) setSrData((prev) => ({ ...prev, label_url: json.label_url }));
      if (json.invoice_url) setSrData((prev) => ({ ...prev, invoice_url: json.invoice_url }));

      invalidateCache(`/api/orders/${order.id}`);
    } catch (err) {
      setSrMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setSrLoading(null);
      setTimeout(() => setSrMsg(""), 5000);
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
  // Merge live API data with any updates from Shiprocket actions
  const sr = { ...order, ...srData };

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

          {/* Shiprocket Shipping & Tracking */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Shiprocket</h2>

            {sr.awb_code ? (
              <div className="space-y-3">
                {/* AWB */}
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">AWB Code</div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{sr.awb_code}</div>
                </div>
                {sr.courier_name && (
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Courier</div>
                    <div className="text-sm text-gray-800">{sr.courier_name}</div>
                  </div>
                )}
                {sr.shiprocket_order_id && (
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Shiprocket ID</div>
                    <div className="text-sm text-gray-600">{sr.shiprocket_order_id}</div>
                  </div>
                )}

                {/* Tracking link */}
                {sr.tracking_url && (
                  <a
                    href={sr.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Track Shipment ↗
                  </a>
                )}

                {/* Label / Invoice buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => doShiprocketAction("label")}
                    disabled={srLoading === "label"}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {srLoading === "label" ? "Loading…" : sr.label_url ? "Refresh Label" : "Get Label"}
                  </button>
                  {sr.label_url && (
                    <a
                      href={sr.label_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Print Label ↗
                    </a>
                  )}
                  <button
                    onClick={() => doShiprocketAction("invoice")}
                    disabled={srLoading === "invoice"}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {srLoading === "invoice" ? "Loading…" : sr.invoice_url ? "Refresh Invoice" : "Get Invoice"}
                  </button>
                  {sr.invoice_url && (
                    <a
                      href={sr.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Print Invoice ↗
                    </a>
                  )}
                </div>
              </div>
            ) : sr.shiprocket_order_id ? (
              /* Order created but no AWB yet */
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Shiprocket ID</div>
                  <div className="text-sm text-gray-600">{sr.shiprocket_order_id}</div>
                </div>
                <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                  Shipment created — AWB not yet assigned
                </p>
                <button
                  onClick={() => doShiprocketAction("label")}
                  disabled={srLoading === "label"}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {srLoading === "label" ? "Loading…" : "Get Label"}
                </button>
              </div>
            ) : (
              /* No Shiprocket order yet */
              <div className="space-y-3">
                <p className="text-sm text-gray-400">No shipment created yet.</p>
                {order.payment_status === "paid" ? (
                  <button
                    onClick={() => doShiprocketAction("create")}
                    disabled={srLoading === "create"}
                    className="w-full text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {srLoading === "create" ? "Creating shipment…" : "Create Shipment"}
                  </button>
                ) : (
                  <p className="text-xs text-gray-400">
                    Mark payment as &ldquo;paid&rdquo; first to create a shipment.
                  </p>
                )}
              </div>
            )}

            {srMsg && (
              <p className={`text-xs mt-2 ${srMsg.includes("Failed") || srMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
                {srMsg}
              </p>
            )}
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
