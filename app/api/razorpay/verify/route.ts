export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";
import { createDelhiveryOrder, parseWeightKg } from "@/lib/delhivery";

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  let body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    db_order_id: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch order items to decrement stock
  const { data: orderData } = await supabase
    .from("orders")
    .select(`
      id, order_number,
      items:order_items(id, product_weight_id, quantity)
    `)
    .eq("id", db_order_id)
    .single();

  if (orderData?.items && Array.isArray(orderData.items)) {
    // Decrement stock for each item
    for (const item of orderData.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const weightId = (item as any).product_weight_id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qty = (item as any).quantity ?? 1;
      if (weightId) {
        // Decrement stock safely
        const { data: weight } = await supabase
          .from("product_weights")
          .select("stock_quantity")
          .eq("id", weightId)
          .single();
        if (weight) {
          const newStock = Math.max(0, (weight.stock_quantity ?? 0) - qty);
          await supabase
            .from("product_weights")
            .update({ stock_quantity: newStock })
            .eq("id", weightId);
        }
      }
    }
  }

  // Mark order as paid + confirmed in DB
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      notes: `razorpay_payment_id:${razorpay_payment_id}`,
    })
    .eq("id", db_order_id)
    .select("order_number")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  // Auto-create Delhivery order (best-effort — payment is already confirmed above)
  if (process.env.DELHIVERY_TOKEN) {
    try {
      // Fetch full order details
      const { data: fullOrder } = await supabase
        .from("orders")
        .select(`
          id, order_number, customer_name, customer_email, customer_phone,
          subtotal, shipping_cost, courier_id, shipping_address,
          created_at,
          items:order_items(product_name, weight_label, quantity, unit_price)
        `)
        .eq("id", db_order_id)
        .single();

      if (fullOrder) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const addr = (fullOrder.shipping_address ?? {}) as Record<string, any>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderItems = (fullOrder.items ?? []) as any[];

        // Total weight in kg
        const totalWeight = orderItems.reduce((sum: number, item: { weight_label: string; quantity: number }) => {
          return sum + parseWeightKg(item.weight_label) * item.quantity;
        }, 0);

        const orderDate = new Date(fullOrder.created_at)
          .toISOString()
          .replace("T", " ")
          .slice(0, 16);

        const delResult = await createDelhiveryOrder({
          order_number: fullOrder.order_number,
          order_date: orderDate,
          customer_name: fullOrder.customer_name,
          customer_email: fullOrder.customer_email,
          customer_phone: fullOrder.customer_phone,
          address: addr.address ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
          pincode: addr.pincode ?? "",
          items: orderItems.map((item) => ({
            name: item.product_name,
            sku: `${item.product_name.toLowerCase().replace(/\s+/g, "-")}-${item.weight_label.toLowerCase().replace(/\s+/g, "")}`,
            units: item.quantity,
            selling_price: item.unit_price,
          })),
          subtotal: fullOrder.subtotal,
          shipping_charges: fullOrder.shipping_cost ?? 0,
          weight_kg: Math.max(totalWeight, 0.1),
          payment_method: "Prepaid",
        });

        // Store Delhivery details back in the order
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbUpdate: Record<string, any> = {
          delhivery_package_id: delResult.package_id,
          delhivery_waybill: delResult.waybill,
        };
        if (delResult.waybill) dbUpdate.awb_code = delResult.waybill;
        dbUpdate.courier_name = "Delhivery";

        await supabase.from("orders").update(dbUpdate).eq("id", db_order_id);
      }
    } catch (err) {
      // Log but never block the payment confirmation response
      console.error("[Delhivery] auto-create failed:", err);
    }
  }

  return NextResponse.json({ success: true, order_number: data.order_number });
}
