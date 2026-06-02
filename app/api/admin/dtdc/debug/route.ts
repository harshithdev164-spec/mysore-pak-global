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
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Pass ?order_id=<uuid>" },
      { status: 400 }
    );
  }

  const env = {
    DTDC_API_BASE_URL: process.env.DTDC_API_BASE_URL ?? "https://apis.dtdc.in/dtdc-api/api/customer/integration",
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
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, payment_method, shipping_address, created_at,
      items:order_items(product_name, weight_label, quantity, unit_price)
    `)
    .eq("id", orderId)
    .single();

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
