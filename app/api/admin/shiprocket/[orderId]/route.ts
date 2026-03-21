export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  createShiprocketOrder,
  generateLabel,
  generateInvoice,
  parseWeightKg,
} from "@/lib/shiprocket";

// POST /api/admin/shiprocket/[orderId]?action=create|label|invoice
export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  if (!process.env.SHIPROCKET_EMAIL) {
    return NextResponse.json({ error: "Shiprocket not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "create";
  const { orderId } = params;

  const supabase = createAdminClient();

  // Fetch the full order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, courier_id,
      shiprocket_order_id, shiprocket_shipment_id,
      awb_code, courier_name, tracking_url, label_url, invoice_url,
      shipping_address, created_at,
      items:order_items(product_name, weight_label, quantity, unit_price)
    `)
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    if (action === "create") {
      // Manually trigger Shiprocket order creation
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

      const srResult = await createShiprocketOrder({
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
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update: Record<string, any> = {
        shiprocket_order_id: srResult.order_id,
        shiprocket_shipment_id: srResult.shipment_id,
      };
      if (srResult.awb_code) update.awb_code = srResult.awb_code;
      if (srResult.courier_name) update.courier_name = srResult.courier_name;
      if (srResult.tracking_url) update.tracking_url = srResult.tracking_url;
      if (srResult.label_url) update.label_url = srResult.label_url;

      await supabase.from("orders").update(update).eq("id", orderId);

      return NextResponse.json({ success: true, data: srResult });
    }

    if (action === "label") {
      if (!order.shiprocket_shipment_id) {
        return NextResponse.json({ error: "No shipment ID — create shipment first" }, { status: 400 });
      }
      const result = await generateLabel(order.shiprocket_shipment_id);
      const labelUrl = result?.label_url ?? result?.response?.label_url;
      if (labelUrl) {
        await supabase.from("orders").update({ label_url: labelUrl }).eq("id", orderId);
      }
      return NextResponse.json({ success: true, label_url: labelUrl, data: result });
    }

    if (action === "invoice") {
      if (!order.shiprocket_order_id) {
        return NextResponse.json({ error: "No Shiprocket order ID — create shipment first" }, { status: 400 });
      }
      const result = await generateInvoice(order.shiprocket_order_id);
      const invoiceUrl = result?.invoice_url ?? result?.data?.invoice_url;
      if (invoiceUrl) {
        await supabase.from("orders").update({ invoice_url: invoiceUrl }).eq("id", orderId);
      }
      return NextResponse.json({ success: true, invoice_url: invoiceUrl, data: result });
    }

    return NextResponse.json({ error: "Unknown action. Use: create, label, or invoice" }, { status: 400 });
  } catch (err) {
    console.error(`[Shiprocket admin] action=${action}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Shiprocket action failed" },
      { status: 502 }
    );
  }
}
