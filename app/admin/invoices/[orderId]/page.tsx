"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { buildInvoice, SELLER, InvoiceSummary } from "@/lib/invoice-utils";
import { Loader2, Printer } from "lucide-react";

interface OrderItem {
  id?: string;
  product_name: string;
  weight_label?: string;
  quantity: number;
  unit_price: number;
  category?: string | null;
}

interface OrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  shipping_address: Record<string, string>;
  items: OrderItem[];
}

export default function InvoicePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else if (json.data) {
          setOrder(json.data);
        } else {
          setError("Order not found");
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-600">
        {error ?? "Order not found"}
      </div>
    );
  }

  const invoice = buildInvoice(
    order.items ?? [],
    order.shipping_cost ?? 0,
    order.shipping_address ?? {}
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Toolbar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      <InvoiceTemplate order={order} invoice={invoice} />

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .invoice-page { box-shadow: none !important; border: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────
// Reusable invoice template — also used in bulk
// ──────────────────────────────────────────────
export function InvoiceTemplate({
  order,
  invoice,
}: {
  order: OrderRecord;
  invoice: InvoiceSummary;
}) {
  const addr = order.shipping_address ?? {};
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="invoice-page max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg p-6 sm:p-10 text-[12px] text-gray-900 font-sans page-break-after-always">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b-2 border-gray-900">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Logo" className="h-14 w-auto" />
          <div>
            <div className="font-bold text-base text-gray-900 leading-tight">{SELLER.name}</div>
            <div className="text-[11px] text-gray-600 leading-snug mt-0.5">
              {SELLER.address}, {SELLER.pincode}<br />
              GSTIN: <span className="font-semibold">{SELLER.gstin}</span> · PAN: {SELLER.pan}<br />
              {SELLER.phone} · {SELLER.email}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-wide text-gray-900 uppercase">
            {invoice.isExport ? "Export Invoice" : "Tax Invoice"}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {invoice.isExport ? "Supply under LUT — Zero rated" : "Original For Recipient"}
          </div>
        </div>
      </div>

      {/* Invoice meta + Bill to */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="border border-gray-200 rounded p-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Bill To</div>
          <div className="font-semibold text-gray-900">{order.customer_name}</div>
          <div className="text-[11px] text-gray-700 leading-snug mt-0.5">
            {addr.address ?? "—"}<br />
            {addr.city ?? ""}{addr.city ? ", " : ""}{addr.state ?? ""} {addr.postal_code ?? addr.pincode ?? ""}<br />
            {addr.country ?? "IN"}
          </div>
          <div className="text-[11px] text-gray-600 mt-1">
            Phone: {order.customer_phone} · Email: {order.customer_email}
          </div>
        </div>

        <div className="border border-gray-200 rounded p-3 text-[11px]">
          <div className="grid grid-cols-2 gap-y-1">
            <span className="text-gray-500">Invoice No.</span>
            <span className="font-semibold text-right">{order.order_number}</span>

            <span className="text-gray-500">Invoice Date</span>
            <span className="font-semibold text-right">{invoiceDate}</span>

            <span className="text-gray-500">Place of Supply</span>
            <span className="font-semibold text-right">
              {invoice.placeOfSupply}{invoice.placeOfSupplyCode !== "—" ? ` (${invoice.placeOfSupplyCode})` : ""}
            </span>

            <span className="text-gray-500">Supply Type</span>
            <span className="font-semibold text-right">
              {invoice.isExport
                ? "Export of goods"
                : invoice.isInterState
                ? "Inter-state"
                : "Intra-state"}
            </span>

            <span className="text-gray-500">Reverse Charge</span>
            <span className="font-semibold text-right">No</span>
          </div>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full mt-4 border border-gray-300 text-[11px]">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border border-gray-300 px-2 py-1.5 text-left w-6">#</th>
            <th className="border border-gray-300 px-2 py-1.5 text-left">Description</th>
            <th className="border border-gray-300 px-2 py-1.5 text-center">HSN</th>
            <th className="border border-gray-300 px-2 py-1.5 text-right">Qty</th>
            <th className="border border-gray-300 px-2 py-1.5 text-right">Rate</th>
            <th className="border border-gray-300 px-2 py-1.5 text-right">Taxable</th>
            <th className="border border-gray-300 px-2 py-1.5 text-center">GST%</th>
            {invoice.isInterState ? (
              <th className="border border-gray-300 px-2 py-1.5 text-right">IGST</th>
            ) : invoice.isExport ? null : (
              <>
                <th className="border border-gray-300 px-2 py-1.5 text-right">CGST</th>
                <th className="border border-gray-300 px-2 py-1.5 text-right">SGST</th>
              </>
            )}
            <th className="border border-gray-300 px-2 py-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((l, i) => (
            <tr key={i} className="text-gray-800">
              <td className="border border-gray-300 px-2 py-1.5 text-center">{i + 1}</td>
              <td className="border border-gray-300 px-2 py-1.5">{l.description}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{l.hsn}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-right">{l.qty}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-right">{l.rate.toFixed(2)}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-right">{l.taxableValue.toFixed(2)}</td>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{l.gstRate}%</td>
              {invoice.isInterState ? (
                <td className="border border-gray-300 px-2 py-1.5 text-right">{l.igst.toFixed(2)}</td>
              ) : invoice.isExport ? null : (
                <>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{l.cgst.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{l.sgst.toFixed(2)}</td>
                </>
              )}
              <td className="border border-gray-300 px-2 py-1.5 text-right font-semibold">{l.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + Amount in words */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="border border-gray-200 rounded p-3 text-[11px]">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Amount in Words</div>
          <div className="font-semibold text-gray-800">{invoice.amountInWords}</div>

          <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-500 leading-relaxed">
            Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
          </div>
        </div>

        <div className="text-[12px]">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Taxable value</span>
            <span className="font-medium">₹{invoice.taxableValue.toFixed(2)}</span>
          </div>
          {!invoice.isExport && invoice.isInterState && (
            <div className="flex justify-between py-1">
              <span className="text-gray-600">IGST</span>
              <span className="font-medium">₹{invoice.igstTotal.toFixed(2)}</span>
            </div>
          )}
          {!invoice.isExport && !invoice.isInterState && (
            <>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">CGST</span>
                <span className="font-medium">₹{invoice.cgstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">SGST</span>
                <span className="font-medium">₹{invoice.sgstTotal.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-1">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">₹{invoice.shippingCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 mt-1 border-t-2 border-gray-900 font-bold text-base">
            <span>Grand Total</span>
            <span>₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-gray-200 flex justify-between items-end text-[10px] text-gray-500">
        <div>
          {invoice.isExport ? (
            <span>Supply meant for export under bond / Letter of Undertaking without payment of IGST.</span>
          ) : (
            <span>Subject to {SELLER.stateName} jurisdiction. E. & O.E.</span>
          )}
        </div>
        <div className="text-right">
          <div className="mb-6 font-medium text-gray-700">For {SELLER.name}</div>
          <div className="border-t border-gray-300 pt-1">Authorised Signatory</div>
        </div>
      </div>
    </div>
  );
}
