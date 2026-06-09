export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  createDtdcOrder,
  getLastDtdcExchange,
  isDtdcConfigured,
} from "@/lib/dtdc";
import { parseWeightKg } from "@/lib/delhivery";

// GET /api/admin/dtdc/debug?order_id=<uuid>
//
// Re-runs createDtdcOrder for the given order and returns the FULL
// DTDC request + response so we can see exactly why DTDC is rejecting
// the shipment. Use this when the checkout flow fails silently with DTDC.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Accept either `order_id` (uuid), `order_number` (WMP-A12345), or `phone` (last 10 digits).
  let orderId = searchParams.get("order_id") ?? "";
  const orderNumber = searchParams.get("order_number") ?? "";
  const phoneQuery = (searchParams.get("phone") ?? "").replace(/\D/g, "");

  if (!orderId && !orderNumber && !phoneQuery) {
    return NextResponse.json(
      { error: "Provide one of ?order_id=<uuid> | ?order_number=<order_number> | ?phone=<10-digit>" },
      { status: 400 }
    );
  }

  // The literal env var value (so we can spot stale Vercel settings)
  // AND a separate `effective_base_url` field showing what the lib will
  // actually use after broken-URL fallback.
  const rawBaseUrl = (process.env.DTDC_API_BASE_URL ?? "").trim();
  const useLive = process.env.DTDC_USE_LIVE === "true";
  // Mirrors src/lib/dtdc.ts pickBaseUrl: DTDC_USE_LIVE=true wins
  // unconditionally so a stale staging DTDC_API_BASE_URL in Vercel
  // never silently routes real orders to sandbox.
  const effectiveBaseUrl = (() => {
    if (useLive) return "https://pxapi.dtdc.in/api/customer/integration";
    const STALE = new Set([
      "https://apis.dtdc.in/dtdc-api/api/customer/integration",
      "https://api.dtdc.in/dtdc-api/api/customer/integration",
    ]);
    if (rawBaseUrl && !STALE.has(rawBaseUrl)) return rawBaseUrl;
    return "https://alphademodashboardapi.shipsy.io/api/customer/integration";
  })();
  // Safe fingerprints — show enough to recognise which key/token is loaded
  // without exposing the secret. Live creds start with "c9679", sandbox
  // start with "f4ae6" — the fingerprint alone tells us which env Vercel has.
  const fp = (v: string | undefined): string => {
    if (!v) return "MISSING";
    if (v.length <= 10) return v;
    return v.slice(0, 6) + "...." + v.slice(-4) + ` (len=${v.length})`;
  };

  const env = {
    DTDC_API_BASE_URL: rawBaseUrl || "(not set)",
    effective_base_url: effectiveBaseUrl,
    environment_mode: useLive ? "LIVE (pxapi.dtdc.in)" : "STAGING (shipsy demo)",
    DTDC_API_KEY_fingerprint: fp(process.env.DTDC_API_KEY),
    DTDC_X_ACCESS_TOKEN_fingerprint: fp(process.env.DTDC_X_ACCESS_TOKEN),
    expected_live_api_key_fp: "c9679d...6e1 (len=30)",
    expected_sandbox_api_key_fp: "f4ae60...5f0 (len=30)",
    expected_live_customer_code: "BO12814",
    expected_sandbox_customer_code: "GL018",
    DTDC_API_KEY: process.env.DTDC_API_KEY ? "set" : "MISSING",
    DTDC_X_ACCESS_TOKEN: process.env.DTDC_X_ACCESS_TOKEN ? "set" : "MISSING",
    DTDC_CUSTOMER_CODE: process.env.DTDC_CUSTOMER_CODE ? "set" : "MISSING",
    DTDC_SERVICE_TYPE_ID: process.env.DTDC_SERVICE_TYPE_ID ?? "GROUND EXPRESS",
    DTDC_BASE_RATE_INR: process.env.DTDC_BASE_RATE_INR ?? "80",
    DTDC_PER_KG_INR: process.env.DTDC_PER_KG_INR ?? "40",
    DTDC_ETD_DAYS: process.env.DTDC_ETD_DAYS ?? "3-5",
    // Pickup (origin) config — DTDC-specific
    DTDC_PICKUP_NAME: process.env.DTDC_PICKUP_NAME ?? "MISSING",
    DTDC_PICKUP_PHONE: process.env.DTDC_PICKUP_PHONE ?? "MISSING",
    DTDC_PICKUP_ADDRESS_LINE1: process.env.DTDC_PICKUP_ADDRESS_LINE1 ?? "MISSING",
    DTDC_PICKUP_ADDRESS_LINE2: process.env.DTDC_PICKUP_ADDRESS_LINE2 ?? "",
    DTDC_PICKUP_PINCODE: process.env.DTDC_PICKUP_PINCODE ?? "MISSING",
    DTDC_PICKUP_CITY: process.env.DTDC_PICKUP_CITY ?? "MISSING",
    DTDC_PICKUP_STATE: process.env.DTDC_PICKUP_STATE ?? "MISSING",
    configured: isDtdcConfigured(),
  };

  const supabase = createAdminClient();
  let order: any = null;
  let orderErr: any = null;

  // If an explicit UUID-like orderId was provided, try that first.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  if (isUuid) {
    const res = await supabase
      .from("orders")
      .select(`
        id, order_number, customer_name, customer_email, customer_phone,
        subtotal, shipping_cost, payment_method, shipping_address, created_at,
        items:order_items(product_name, weight_label, quantity, unit_price)
      `)
      .eq("id", orderId)
      .single();
    order = res.data;
    orderErr = res.error;
  }

  // If not found by UUID or not provided, try order_number
  if (!order && orderNumber) {
    const res = await supabase
      .from("orders")
      .select(`
        id, order_number, customer_name, customer_email, customer_phone,
        subtotal, shipping_cost, payment_method, shipping_address, created_at,
        items:order_items(product_name, weight_label, quantity, unit_price)
      `)
      .eq("order_number", orderNumber)
      .limit(1);
    order = (res.data && res.data[0]) ?? null;
    orderErr = res.error;
  }

  // If still not found, try phone lookup (match last 10 digits)
  if (!order && phoneQuery) {
    const last10 = phoneQuery.slice(-10);
    const res = await supabase
      .from("orders")
      .select(`
        id, order_number, customer_name, customer_email, customer_phone,
        subtotal, shipping_cost, payment_method, shipping_address, created_at,
        items:order_items(product_name, weight_label, quantity, unit_price)
      `)
      .ilike("customer_phone", `%${last10}%`)
      .order("created_at", { ascending: false })
      .limit(1);
    order = (res.data && res.data[0]) ?? null;
    orderErr = res.error;
  }

  if (orderErr || !order) {
    return NextResponse.json(
      { error: orderErr?.message ?? "Order not found", env },
      { status: 404 }
    );
  }

  if (!isDtdcConfigured()) {
    return NextResponse.json(
      {
        error: "DTDC not configured. Set DTDC_API_KEY and DTDC_CUSTOMER_CODE in .env.local",
        env,
      },
      { status: 503 }
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr = (order.shipping_address ?? {}) as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = (order.items ?? []) as any[];

    const totalWeight = orderItems.reduce(
      (sum: number, item: { weight_label: string; quantity: number }) => {
        return sum + parseWeightKg(item.weight_label) * item.quantity;
      },
      0
    );

    const result = await createDtdcOrder({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? "",
      items: orderItems.map((item) => ({
        name: item.product_name,
        units: item.quantity,
        selling_price: item.unit_price,
      })),
      subtotal: order.subtotal,
      shipping_charges: order.shipping_cost ?? 0,
      weight_kg: Math.max(totalWeight, 0.5),
      payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
    });

    const lastExchange = getLastDtdcExchange();

    return NextResponse.json({
      success: true,
      result,
      env,
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_weight_kg: totalWeight,
        items_count: orderItems.length,
      },
      last_exchange: lastExchange,
    });
  } catch (err) {
    const lastExchange = getLastDtdcExchange();
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "DTDC order creation failed",
        env,
        last_exchange: lastExchange,
      },
      { status: 502 }
    );
  }
}
