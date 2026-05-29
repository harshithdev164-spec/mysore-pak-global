export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createDhlShipment, isDhlConfigured } from "@/lib/dhl";
import { parseWeightKg } from "@/lib/delhivery";
import { HS_CODE_SWEETS } from "@/lib/countries";

// POST /api/admin/dhl/[orderId]?action=create
// Manually create or recreate the DHL Express shipment for an order.
export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  if (!isDhlConfigured()) {
    return NextResponse.json({ error: "DHL not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "create";
  const { orderId } = params;

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, payment_method,
      awb_code, courier_name,
      shipping_address, created_at,
      items:order_items(product_name, weight_label, quantity, unit_price)
    `)
    .eq("id", orderId)
    .single();

  if (orderError) {
    console.error("[DHL admin] order lookup failed:", orderError);
    return NextResponse.json(
      { error: `Order lookup failed: ${orderError.message}` },
      { status: 500 }
    );
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (order.shipping_address ?? {}) as Record<string, any>;
  const country = String(addr.country ?? "IN").toUpperCase();

  if (country === "IN") {
    return NextResponse.json(
      { error: "DHL is for international orders only. Use the Delhivery action for IN." },
      { status: 400 }
    );
  }

  try {
    if (action === "create") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderItems = (order.items ?? []) as any[];
      const totalWeight = orderItems.reduce(
        (sum: number, item: { weight_label: string; quantity: number }) =>
          sum + parseWeightKg(item.weight_label) * item.quantity,
        0
      );

      const dhlResult = await createDhlShipment({
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

      // Persist only the universal columns. dhl_* convenience columns require
      // add_dhl_columns.sql; we don't depend on them — awb_code carries the AWB.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update: Record<string, any> = { courier_name: "DHL Express" };
      if (dhlResult.tracking_number) {
        update.awb_code = dhlResult.tracking_number;
        update.status = "pickup";
      }

      await supabase.from("orders").update(update).eq("id", orderId);

      return NextResponse.json({ success: true, data: dhlResult });
    }

    return NextResponse.json({ error: "Unknown action. Use: create" }, { status: 400 });
  } catch (err) {
    console.error(`[DHL admin] action=${action}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DHL action failed" },
      { status: 502 }
    );
  }
}
