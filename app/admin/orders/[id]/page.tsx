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
  confirmation_email_sent_at?: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  notes: string | null;
  shipping_address: Record<string, string>;
  shipping_country?: string | null;  // optional (denormalized column from add_dhl_columns.sql migration; may be absent)
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  // Tracking — awb_code is the single canonical AWB column
  awb_code: string | null;
  courier_name: string | null;
  courier_id?: number | null;   // 100 = DHL Express, 200 = DTDC, else Delhivery
  // Optional convenience columns from migrations that may not be present
  delhivery_package_id?: string | null;
  delhivery_waybill?: string | null;
  tracking_url?: string | null;
  label_url?: string | null;
  invoice_url?: string | null;
  dhl_shipment_id?: string | null;
  dhl_tracking_number?: string | null;
  dhl_label_url?: string | null;
  dhl_invoice_url?: string | null;
}

const ORDER_STATUSES = ["pending", "confirmed", "pickup", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  pickup: "bg-orange-100 text-orange-800",
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

  // Delhivery action states
  const [delLoading, setDelLoading] = useState<string | null>(null); // which action is running
  const [delMsg, setDelMsg] = useState("");
  const [delData, setDelData] = useState<Partial<Order>>({});

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

  async function doCourierAction(courier: "delhivery" | "dhl" | "dtdc", action: string) {
    if (!order) return;
    setDelLoading(action);
    setDelMsg("");
    try {
      const res = await fetch(`/api/admin/${courier}/${order.id}?action=${action}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");

      setDelMsg("Shipment created!");
      if (json.data) {
        if (courier === "delhivery") {
          setDelData((prev) => ({
            ...prev,
            delhivery_package_id: json.data.package_id ?? prev.delhivery_package_id,
            delhivery_waybill: json.data.waybill ?? prev.delhivery_waybill,
            awb_code: json.data.waybill ?? prev.awb_code,
            courier_name: "Delhivery",
          }));
        } else if (courier === "dtdc") {
          setDelData((prev) => ({
            ...prev,
            awb_code: json.data.reference_number ?? json.data.waybill ?? prev.awb_code,
            courier_name: "DTDC Express",
          }));
        } else {
          setDelData((prev) => ({
            ...prev,
            dhl_shipment_id: json.data.shipment_id ?? prev.dhl_shipment_id,
            dhl_tracking_number: json.data.tracking_number ?? prev.dhl_tracking_number,
            dhl_label_url: json.data.label_url ?? prev.dhl_label_url,
            dhl_invoice_url: json.data.invoice_url ?? prev.dhl_invoice_url,
            awb_code: json.data.tracking_number ?? prev.awb_code,
            courier_name: "DHL Express",
          }));
        }
      }

      invalidateCache(`/api/orders/${order.id}`);
    } catch (err) {
      setDelMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setDelLoading(null);
    }
  }

  async function syncTracking(courier: "delhivery" | "dhl") {
    if (!order) return;
    setDelLoading("sync");
    setDelMsg("");
    try {
      const res = await fetch(`/api/admin/${courier}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");

      const info = json.orders?.[0];
      const label = courier === "delhivery" ? "Delhivery" : "DHL";
      if (info?.to) {
        setDelMsg(`Status updated: ${info.from} → ${info.to}`);
        setStatus(info.to);
        invalidateCache(`/api/orders/${order.id}`);
      } else {
        setDelMsg(`No change (${label}: ${info?.raw ?? "unknown"})`);
      }
    } catch (err) {
      setDelMsg(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setDelLoading(null);
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
  const sr = { ...order, ...delData };

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
        <Link
          href={`/admin/invoices/${order.id}`}
          target="_blank"
          className="ml-auto inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          📄 Invoice
        </Link>
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

          {/* Shipping & Tracking — branches on country */}
          {(() => {
            const country = (
              sr.shipping_country ??
              (sr.shipping_address as Record<string, string> | undefined)?.country ??
              "IN"
            ).toUpperCase();
            const isIntl = country !== "IN";

            if (isIntl) {
              // ── DHL Express panel ─────────────────────────────────
              return (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    DHL Express
                    <span className="text-xs font-normal text-gray-500">({country})</span>
                  </h2>

                  {sr.dhl_tracking_number ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Tracking Number</div>
                        <div className="font-mono text-sm font-semibold text-gray-900">{sr.dhl_tracking_number}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Courier</div>
                        <div className="text-sm text-gray-800">{sr.courier_name ?? "DHL Express"}</div>
                      </div>
                      {sr.dhl_shipment_id && sr.dhl_shipment_id !== sr.dhl_tracking_number && (
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Shipment ID</div>
                          <div className="text-sm text-gray-600">{sr.dhl_shipment_id}</div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${sr.dhl_tracking_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Track Shipment ↗
                        </a>
                        {sr.dhl_label_url && (
                          <a
                            href={sr.dhl_label_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`label-${sr.order_number}.pdf`}
                            className="inline-block text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Label PDF ↓
                          </a>
                        )}
                        {sr.dhl_invoice_url && (
                          <a
                            href={sr.dhl_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`invoice-${sr.order_number}.pdf`}
                            className="inline-block text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Commercial Invoice ↓
                          </a>
                        )}
                        <button
                          onClick={() => syncTracking("dhl")}
                          disabled={delLoading === "sync"}
                          className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          <span className={delLoading === "sync" ? "animate-spin inline-block" : ""}>↻</span>
                          {delLoading === "sync" ? "Syncing…" : "Sync status"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">No DHL shipment created yet.</p>
                      <button
                        onClick={() => doCourierAction("dhl", "create")}
                        disabled={delLoading === "create"}
                        className="w-full text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {delLoading === "create" ? "Creating shipment…" : "Create DHL Shipment"}
                      </button>
                    </div>
                  )}

                  {delMsg && (
                    <p className={`text-xs mt-2 ${delMsg.includes("Failed") || delMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
                      {delMsg}
                    </p>
                  )}
                </div>
              );
            }

            // ── DTDC panel (domestic) ─────────────────────────
            // Route to DTDC if the courier was already created as DTDC, OR
            // if the customer selected DTDC at checkout (courier_id === 200).
            const isDtdc =
              sr.courier_name?.toLowerCase().includes("dtdc") ||
              (sr as { courier_id?: number }).courier_id === 200;
            if (isDtdc) {
              return (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-4">DTDC Express</h2>

                  {sr.awb_code ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Reference / AWB Code</div>
                        <div className="font-mono text-sm font-semibold text-gray-900">{sr.awb_code}</div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://trackcourier.io/track-and-trace/dtdc/${sr.awb_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Track Shipment ↗
                        </a>
                        <a
                          href={`/api/admin/dtdc/${order.id}/label`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Label PDF ↓
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">No DTDC shipment created yet.</p>
                      <button
                        onClick={() => doCourierAction("dtdc", "create")}
                        disabled={delLoading === "create"}
                        className="w-full text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {delLoading === "create" ? "Creating shipment…" : "Create DTDC Shipment"}
                      </button>
                    </div>
                  )}

                  {delMsg && (
                    <p className={`text-xs mt-2 ${delMsg.includes("Failed") || delMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
                      {delMsg}
                    </p>
                  )}
                </div>
              );
            }

            // ── Delhivery panel (domestic) ─────────────────────────
            return (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Delhivery</h2>

                {sr.awb_code ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Waybill / AWB Code</div>
                      <div className="font-mono text-sm font-semibold text-gray-900">{sr.awb_code}</div>
                    </div>
                    {sr.courier_name && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Courier</div>
                        <div className="text-sm text-gray-800">{sr.courier_name}</div>
                      </div>
                    )}
                    {sr.delhivery_package_id && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Delhivery Package ID</div>
                        <div className="text-sm text-gray-600">{sr.delhivery_package_id}</div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {sr.awb_code && (
                        <a
                          href={`https://www.delhivery.com/tracking?id=${sr.awb_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Track Shipment ↗
                        </a>
                      )}
                      <button
                        onClick={() => syncTracking("delhivery")}
                        disabled={delLoading === "sync"}
                        className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <span className={delLoading === "sync" ? "animate-spin inline-block" : ""}>↻</span>
                        {delLoading === "sync" ? "Syncing…" : "Sync status"}
                      </button>
                    </div>
                  </div>
                ) : sr.delhivery_package_id ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Delhivery Package ID</div>
                      <div className="text-sm text-gray-600">{sr.delhivery_package_id}</div>
                    </div>
                    <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                      Shipment created — AWB not yet assigned
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">No shipment created yet.</p>
                    <button
                      onClick={() => doCourierAction("delhivery", "create")}
                      disabled={delLoading === "create"}
                      className="w-full text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {delLoading === "create" ? "Creating shipment…" : "Create Shipment"}
                    </button>
                  </div>
                )}

                {delMsg && (
                  <p className={`text-xs mt-2 ${delMsg.includes("Failed") || delMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
                    {delMsg}
                  </p>
                )}
              </div>
            );
          })()}

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

          {/* Confirmation email panel — status + admin resend button */}
          <ConfirmationEmailPanel order={order} />


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

// ── Confirmation email status + resend button ─────────────────────────────
// Compact panel shown in the right column of the order detail page. Displays
// green tick + timestamp when the ZeptoMail order-confirmation email has
// gone out, and a Resend button that always re-fires (force: true) — useful
// when a customer says they never received the email.
function ConfirmationEmailPanel({ order }: { order: Order }) {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const sentAt = order.confirmation_email_sent_at;

  async function resend() {
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/resend-confirmation`, {
        method: "POST",
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setMsg({ kind: "err", text: j.error ?? `Failed (${res.status})` });
      } else {
        setMsg({ kind: "ok", text: "Email re-sent to " + order.customer_email });
        invalidateCache(`/api/orders/${order.id}`);
      }
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-3">Confirmation Email</h2>
      <div className="text-sm space-y-3">
        {sentAt ? (
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" clipRule="evenodd"/>
              </svg>
            </span>
            <div>
              <div className="text-gray-900 font-medium">Sent</div>
              <div className="text-xs text-gray-500">
                {new Date(sentAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 shrink-0 mt-0.5">•</span>
            <div>
              <div className="text-gray-900 font-medium">Not sent yet</div>
              <div className="text-xs text-gray-500">
                Sends automatically after payment is verified.
              </div>
            </div>
          </div>
        )}

        <button
          onClick={resend}
          disabled={sending || !order.customer_email}
          className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "Sending…" : sentAt ? "Resend email" : "Send email now"}
        </button>

        {!order.customer_email && (
          <p className="text-xs text-red-600">No email on file for this customer.</p>
        )}
        {msg && (
          <p className={`text-xs ${msg.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
