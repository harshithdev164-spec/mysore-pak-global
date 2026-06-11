export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  buildKpis, buildGstSummary, buildStateReport,
  buildProductReport, buildPaymentReport, buildDailyTrend,
  presetRange, istDayToUtcRange, GST_RATE_PCT,
  type RangePreset,
} from "@/lib/finance";

// GET /api/admin/finance?preset=30d           — KPIs + reports for last 30 days
// GET /api/admin/finance?preset=custom&from=2026-06-01&to=2026-06-30
// GET /api/admin/finance?preset=30d&status=paid  — only counts paid orders
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const preset = (searchParams.get("preset") ?? "30d") as RangePreset;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const statusFilter = (searchParams.get("status") ?? "all").toLowerCase();

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
    .order("created_at", { ascending: false });

  if (statusFilter === "paid") query = query.eq("payment_status", "paid");
  else if (statusFilter === "pending") query = query.eq("payment_status", "pending");
  else if (statusFilter === "refunded") query = query.eq("payment_status", "refunded");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = (data ?? []) as any[];

  return NextResponse.json({
    range,
    gst_rate_pct: GST_RATE_PCT,
    filter: { preset, status: statusFilter },
    kpis: buildKpis(orders),
    gst_summary: buildGstSummary(orders),
    state_report: buildStateReport(orders),
    product_report: buildProductReport(orders),
    payment_report: buildPaymentReport(orders),
    daily_trend: buildDailyTrend(orders),
    // Pass through a thin order list for the invoice table (cap at 200 for perf)
    invoices: orders.slice(0, 200).map((o) => ({
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      total: Number(o.total ?? 0),
      payment_status: o.payment_status,
      created_at: o.created_at,
    })),
  });
}
