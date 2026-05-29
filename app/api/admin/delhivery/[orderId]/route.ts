export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  createDelhiveryOrder,
  parseWeightKg,
} from "@/lib/delhivery";

// POST /api/admin/delhivery/[orderId]?action=create
export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  if (!process.env.DELHIVERY_TOKEN) {
    return NextResponse.json({ error: "Delhivery not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "create";
  const { orderId } = params;

  const supabase = createAdminClient();

  // Fetch only the fields the create flow actually uses. Avoids referencing
  // legacy/optional columns (tracking_url, label_url, invoice_url, etc.) that
  // may not exist in every deployment.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, payment_method,
      shipping_address, created_at,
      items:order_items(product_name, weight_label, quantity, unit_price)
    `)
    .eq("id", orderId)
    .single();

  if (orderError) {
    console.error("[Delhivery admin] order lookup failed:", orderError);
    return NextResponse.json(
      { error: `Order lookup failed: ${orderError.message}` },
      { status: 500 }
    );
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    if (action === "create") {
      // Manually trigger Delhivery order creation
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

      const delResult = await createDelhiveryOrder({
        order_number: order.order_number,
        order_date: orderDate,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        address: addr.address ?? "",
        city: addr.city ?? "",
        state: addr.state ?? "",
        pincode: addr.pincode ?? "",
        items: orderItems.map((item) => ({
          name: item.product_name,
          sku: item.product_name.toLowerCase().replace(/\s+/g, "-"),
          units: item.quantity,
          selling_price: item.unit_price,
        })),
        subtotal: order.subtotal,
        shipping_charges: order.shipping_cost ?? 0,
        weight_kg: Math.max(totalWeight, 0.1),
        payment_method: isCod ? "COD" : "Prepaid"
      });

      // Persist only the universal fields. delhivery_package_id/delhivery_waybill
      // are denormalized convenience columns from a separate migration that may
      // not exist; we don't depend on them — awb_code carries the tracking number.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update: Record<string, any> = { courier_name: "Delhivery" };
      if (delResult.waybill) {
        update.awb_code = delResult.waybill;
        update.status = "pickup";
      }

      await supabase.from("orders").update(update).eq("id", orderId);

      return NextResponse.json({ success: true, data: delResult });
    }

    // Usually label and invoice are handled via Delhivery dashboard, so we skip separate endpoints for now
    return NextResponse.json({ error: "Unknown action. Use: create" }, { status: 400 });
  } catch (err) {
    console.error(`[Delhivery admin] action=${action}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delhivery action failed" },
      { status: 502 }
    );
  }
}
