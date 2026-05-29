export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  createDhlShipment,
  getLastDhlExchange,
  isDhlConfigured,
} from "@/lib/dhl";
import { HS_CODE_SWEETS } from "@/lib/countries";
import { parseWeightKg } from "@/lib/delhivery";

// GET /api/admin/dhl/debug-ship?order_id=<uuid>
//
// Re-runs PostShipment_CSBV for the given international order and returns the
// FULL SOAP request + response so we can see exactly which CSB-V field DHL
// rejects. Use this when "Create DHL Shipment" fails — DHL India tends to
// return useless top-level errors but the response body usually has more detail.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "Pass ?order_id=<uuid>" }, { status: 400 });
  }

  const env = {
    DHL_API_BASE_URL: process.env.DHL_API_BASE_URL ?? "(default)",
    DHL_SITE_ID: process.env.DHL_SITE_ID ? "set" : "MISSING",
    DHL_PASSWORD: process.env.DHL_PASSWORD ? "set" : "MISSING",
    DHL_ACCOUNT_NUMBER: process.env.DHL_ACCOUNT_NUMBER ? "set" : "MISSING",
    DHL_IEC_NO: process.env.DHL_IEC_NO ? "set" : "MISSING",
    DHL_GSTIN: process.env.DHL_GSTIN ? "set" : "MISSING",
    DHL_BANK_AD_CODE: process.env.DHL_BANK_AD_CODE ? "set" : "MISSING",
    DHL_PICKUP_STATE_CODE: process.env.DHL_PICKUP_STATE_CODE ?? "(default 29)",
    DHL_PICKUP_STATE_NAME: process.env.DHL_PICKUP_STATE_NAME ?? "(default Karnataka)",
    DHL_IS_USING_IGST: process.env.DHL_IS_USING_IGST ?? "(default NO)",
    DHL_USING_BOND_OR_UT: process.env.DHL_USING_BOND_OR_UT ?? "(default YES)",
    configured: isDhlConfigured(),
  };

  const supabase = createAdminClient();
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_address, created_at,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (order.shipping_address ?? {}) as Record<string, any>;
  const country = String(addr.country ?? "IN").toUpperCase();
  if (country === "IN") {
    return NextResponse.json(
      {
        error: "DHL is for international orders only. This order's country is IN.",
        env,
      },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = (order.items ?? []) as any[];
  const totalWeight = orderItems.reduce(
    (sum: number, item: { weight_label: string; quantity: number }) =>
      sum + parseWeightKg(item.weight_label) * item.quantity,
    0
  );

  let result: unknown = null;
  let error: string | null = null;
  try {
    result = await createDhlShipment({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      address2: addr.address2,
      city: addr.city ?? "",
      state: addr.state ?? "",
      postal_code: addr.postal_code ?? addr.pincode ?? "",
      country,
      items: orderItems.map((item) => ({
        name: item.product_name,
        sku: `${item.product_name.toLowerCase().replace(/\s+/g, "-")}-${item.weight_label.toLowerCase().replace(/\s+/g, "")}`,
        units: item.quantity,
        selling_price_inr: item.unit_price,
        weight_kg: parseWeightKg(item.weight_label),
        hs_code: HS_CODE_SWEETS,
      })),
      declared_value_inr: order.subtotal,
      weight_kg: Math.max(totalWeight, 0.5),
      payment_method: "Prepaid",
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const exchange = getLastDhlExchange();

  return NextResponse.json({
    env,
    order: {
      order_number: order.order_number,
      customer_name: order.customer_name,
      shipping_address: addr,
      total_weight_kg: totalWeight,
    },
    result,
    error,
    exchange,
  });
}
