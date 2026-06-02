export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createDtdcOrder, isDtdcConfigured } from "@/lib/dtdc";
import { parseWeightKg } from "@/lib/delhivery";

// POST /api/admin/dtdc/[orderId]?action=create
//
// Admin-triggered DTDC booking for an existing DB order. Mirrors the Delhivery
// admin endpoint so the order-detail page can offer "Create DTDC Shipment".
export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  if (!isDtdcConfigured()) {
    return NextResponse.json(
      { error: "DTDC not configured (DTDC_API_KEY + DTDC_CUSTOMER_CODE)" },
      { status: 503 }
    );
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
      shipping_address, created_at,
      items:order_items(product_name, weight_label, quantity, unit_price)
    `)
    .eq("id", orderId)
    .single();

  if (orderError) {
    return NextResponse.json(
      { error: `Order lookup failed: ${orderError.message}` },
      { status: 500 }
    );
  }
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (action !== "create") {
    return NextResponse.json({ error: "Unknown action. Use: create" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr = (order.shipping_address ?? {}) as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = (order.items ?? []) as any[];

    const totalWeight = orderItems.reduce(
      (sum: number, item: { weight_label: string; quantity: number }) =>
        sum + parseWeightKg(item.weight_label) * item.quantity,
      0
    );

    const isCod = order.payment_method === "cod";

    const result = await createDtdcOrder({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? addr.postal_code ?? "",
      items: orderItems.map((item) => ({
        name: item.product_name,
        units: item.quantity,
        selling_price: item.unit_price,
      })),
      subtotal: order.subtotal,
      shipping_charges: order.shipping_cost ?? 0,
      weight_kg: Math.max(totalWeight, 0.5),
      payment_method: isCod ? "COD" : "Prepaid",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = { courier_name: "DTDC Express" };
    if (result.reference_number) {
      update.awb_code = result.reference_number;
      update.status = "pickup";
    }
    await supabase.from("orders").update(update).eq("id", orderId);

    return NextResponse.json({
      success: true,
      data: {
        waybill: result.reference_number,
        reference_number: result.reference_number,
        message: result.message,
      },
    });
  } catch (err) {
    console.error(`[DTDC admin] action=${action}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DTDC action failed" },
      { status: 502 }
    );
  }
}
