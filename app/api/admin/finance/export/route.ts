export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase";
import {
  buildKpis, buildGstSummary, buildStateReport,
  buildProductReport, buildPaymentReport, buildDailyTrend,
  presetRange, istDayToUtcRange, GST_RATE_PCT,
  gstSplitForOrder, round2,
  type RangePreset,
} from "@/lib/finance";

// GET /api/admin/finance/export
//   ?format=xlsx (default) → multi-sheet .xlsx workbook
//   ?format=csv&report=<name> → single-sheet CSV
//      report: summary | gst | product | payment | state | daily | invoices
// Shared query params: preset, from, to, status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preset = (searchParams.get("preset") ?? "30d") as RangePreset;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const statusFilter = (searchParams.get("status") ?? "all").toLowerCase();
  const format = (searchParams.get("format") ?? "xlsx").toLowerCase();
  const report = (searchParams.get("report") ?? "invoices").toLowerCase();

  const range = presetRange(preset, { from, to });
  const { fromUtc, toUtc } = istDayToUtcRange(range.from, range.to);

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, discount, total,
      payment_method, payment_status, status,
      shipping_address, shipping_country,
      created_at,
      items:order_items(product_name, quantity, total_price)
    `)
    .gte("created_at", fromUtc)
    .lte("created_at", toUtc)
    .order("created_at", { ascending: true });

  if (statusFilter === "paid") query = query.eq("payment_status", "paid");
  else if (statusFilter === "pending") query = query.eq("payment_status", "pending");
  else if (statusFilter === "refunded") query = query.eq("payment_status", "refunded");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = (data ?? []) as any[];

  const wb = XLSX.utils.book_new();

  // 1. Sales Summary — KPI snapshot + generation metadata
  const kpis = buildKpis(orders);
  const salesSummary = [
    ["World of Mysore Pak — Finance Report"],
    [`Range: ${range.from} → ${range.to} (IST)`],
    [`Status filter: ${statusFilter}`],
    [`GST rate applied: ${GST_RATE_PCT}%`],
    [`Generated at: ${new Date().toISOString()}`],
    [],
    ["Metric", "Value (₹)"],
    ["Total orders", kpis.total_orders],
    ["Total revenue (gross)", kpis.total_revenue],
    ["Subtotal", kpis.total_subtotal],
    ["Discount", kpis.total_discount],
    ["Shipping charges", kpis.total_shipping],
    ["GST collected", kpis.total_gst],
    ["  ↳ CGST", kpis.total_cgst],
    ["  ↳ SGST", kpis.total_sgst],
    ["  ↳ IGST", kpis.total_igst],
    ["Refunded orders", kpis.refunded_orders],
    ["Refunded amount", kpis.refunded_amount],
    ["Net revenue", kpis.net_revenue],
    ["Average order value", kpis.avg_order_value],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(salesSummary), "1. Sales Summary");

  // 2. GST Summary
  const gstRows = buildGstSummary(orders);
  const gstSheet = [
    ["Tax Type", "Taxable Value (₹)", "GST Amount (₹)"],
    ...gstRows.map((r) => [r.tax_type, r.taxable_value, r.gst_amount]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(gstSheet), "2. GST Summary");

  // 3. Product Sales
  const productRows = buildProductReport(orders);
  const productSheet = [
    ["Product", "Qty Sold", "Revenue (₹)"],
    ...productRows.map((r) => [r.product, r.qty, r.revenue]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(productSheet), "3. Product Sales");

  // 4. Payment Report
  const paymentRows = buildPaymentReport(orders);
  const paymentSheet = [
    ["Payment Method", "Orders", "Revenue (₹)"],
    ...paymentRows.map((r) => [r.method, r.orders, r.revenue]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(paymentSheet), "4. Payment Report");

  // 5. State Report
  const stateRows = buildStateReport(orders);
  const stateSheet = [
    ["State", "Orders", "Revenue (₹)", "GST (₹)"],
    ...stateRows.map((r) => [r.state, r.orders, r.revenue, r.gst]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(stateSheet), "5. State Report");

  // 6. Daily Trend
  const dailyRows = buildDailyTrend(orders);
  const dailySheet = [
    ["Date (IST)", "Orders", "Revenue (₹)", "GST (₹)"],
    ...dailyRows.map((r) => [r.date, r.orders, r.revenue, r.gst]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dailySheet), "6. Daily Trend");

  // 7. Invoices — full line items for GST filing reconciliation
  const invoiceSheet = [
    [
      "Order #", "Date (IST)", "Customer", "Phone",
      "Destination state", "Country",
      "Subtotal", "Discount", "Shipping", "Total",
      "Taxable", "CGST", "SGST", "IGST", "GST Total",
      "Payment method", "Payment status",
    ],
  ];
  for (const o of orders) {
    const addr = (o.shipping_address ?? {}) as { state?: string; country?: string };
    const dt = new Date(o.created_at);
    const ist = new Date(dt.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");
    const split = gstSplitForOrder(o);
    invoiceSheet.push([
      o.order_number,
      ist,
      o.customer_name,
      o.customer_phone,
      addr.state ?? "",
      (addr.country ?? o.shipping_country ?? "IN").toString().toUpperCase(),
      round2(Number(o.subtotal ?? 0)),
      round2(Number(o.discount ?? 0)),
      round2(Number(o.shipping_cost ?? 0)),
      round2(Number(o.total ?? 0)),
      split.taxable,
      split.cgst,
      split.sgst,
      split.igst,
      split.total_gst,
      o.payment_method ?? "",
      o.payment_status ?? "",
    ]);
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(invoiceSheet), "7. Invoices");

  // ──────────────────────────────────────────────
  // CSV branch — pick the requested report and stream as text/csv.
  // SheetJS handles the quoting/escaping so commas, quotes, and Unicode
  // in customer names or addresses don't break Excel/Google Sheets parsers.
  // ──────────────────────────────────────────────
  if (format === "csv") {
    const REPORT_MAP: Record<string, { rows: (string | number)[][]; slug: string }> = {
      summary:  { rows: salesSummary, slug: "sales-summary" },
      gst:      { rows: gstSheet, slug: "gst-summary" },
      product:  { rows: productSheet, slug: "product-sales" },
      payment:  { rows: paymentSheet, slug: "payment-report" },
      state:    { rows: stateSheet, slug: "state-report" },
      daily:    { rows: dailySheet, slug: "daily-trend" },
      invoices: { rows: invoiceSheet, slug: "invoices" },
    };
    const picked = REPORT_MAP[report] ?? REPORT_MAP.invoices;
    const sheet = XLSX.utils.aoa_to_sheet(picked.rows);
    const csv = XLSX.utils.sheet_to_csv(sheet, { forceQuotes: false });
    const filename = `WoMP_${picked.slug}_${range.from}_to_${range.to}.csv`;
    // Prepend a UTF-8 BOM so Excel opens it with the right encoding when
    // double-clicked on Windows (otherwise customer names with accents or
    // ₹ symbol render as garbage). Other tools ignore the BOM.
    const body = "﻿" + csv;
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `WoMP_finance_${range.from}_to_${range.to}.xlsx`;

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
