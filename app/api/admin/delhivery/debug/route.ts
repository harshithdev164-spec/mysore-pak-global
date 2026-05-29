export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  createDelhiveryOrder,
  getLastDelhiveryExchange,
  parseWeightKg,
} from "@/lib/delhivery";

// GET /api/admin/delhivery/debug?order_id=<uuid>
//
// Re-runs createDelhiveryOrder for the given order and returns the FULL
// Delhivery request + response so we can see exactly why Delhivery is rejecting
// the shipment. Use this when the admin "Create Shipment" button returns the
// generic "An internal Error has occurred" message.
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
    DELHIVERY_TOKEN: process.env.DELHIVERY_TOKEN ? "set" : "MISSING",
    DELHIVERY_PICKUP_LOCATION: process.env.DELHIVERY_PICKUP_LOCATION ?? "MISSING",
    DELHIVERY_PICKUP_PINCODE: process.env.DELHIVERY_PICKUP_PINCODE ?? "(default 570011)",
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (order.shipping_address ?? {}) as Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = (order.items ?? []) as any[];
  const totalWeight = orderItems.reduce(
    (sum: number, item: { weight_label: string; quantity: number }) =>
      sum + parseWeightKg(item.weight_label) * item.quantity,
    0
  );
  const orderDate = new Date(order.created_at)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16);
  const isCod = order.payment_method === "cod";

  let result: unknown = null;
  let error: string | null = null;
  try {
    result = await createDelhiveryOrder({
      order_number: order.order_number,
      order_date: orderDate,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? addr.postal_code ?? "",
      items: orderItems.map((item) => ({
        name: item.product_name,
        sku: item.product_name.toLowerCase().replace(/\s+/g, "-"),
        units: item.quantity,
        selling_price: item.unit_price,
      })),
      subtotal: order.subtotal,
      shipping_charges: order.shipping_cost ?? 0,
      weight_kg: Math.max(totalWeight, 0.1),
      payment_method: isCod ? "COD" : "Prepaid",
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const exchange = getLastDelhiveryExchange();

  return NextResponse.json({
    env,
    order: {
      order_number: order.order_number,
      customer_name: order.customer_name,
      shipping_address: addr,
      total_weight_kg: totalWeight,
      payment_method: order.payment_method,
    },
    result,
    error,
    exchange,
  });
}
