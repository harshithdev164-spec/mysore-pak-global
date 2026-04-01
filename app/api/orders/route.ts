export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";
import { createShiprocketOrder, parseWeightKg } from "@/lib/shiprocket";

const OrderItemSchema = z.object({
  product_id: z.string().uuid().optional(),
  product_weight_id: z.string().uuid().optional(),
  product_name: z.string().min(1),
  weight_label: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

const CreateOrderSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(10),
  shipping_address: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
  }),
  items: z.array(OrderItemSchema).min(1),
  payment_method: z.string().optional().default("razorpay"),
  notes: z.string().optional(),
  shipping_cost: z.number().min(0).optional(),
  courier_id: z.number().int().positive().optional(),
});

// POST /api/orders — create a new order (also triggers Shiprocket for COD)
export async function POST(request: Request) {
  const supabase = createServerClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { customer_name, customer_email, customer_phone, shipping_address, items, payment_method, notes, courier_id } =
    parsed.data;

  // Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const shipping_cost =
    parsed.data.shipping_cost !== undefined
      ? parsed.data.shipping_cost
      : subtotal > 1500
      ? 0
      : 99;
  const total = subtotal + shipping_cost;

  // Generate human-readable order number
  const order_number = `WMP-${Date.now().toString(36).toUpperCase()}`;

  const isCod = payment_method === "cod";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertPayload: Record<string, any> = {
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    subtotal,
    shipping_cost,
    discount: 0,
    total,
    payment_method: payment_method ?? "razorpay",
    // COD orders are confirmed immediately; Razorpay orders stay pending until verify
    payment_status: isCod ? "pending" : "pending",
    status: isCod ? "confirmed" : "pending",
    shipping_address,
    notes: notes ?? null,
  };
  if (courier_id !== undefined) insertPayload.courier_id = courier_id;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(insertPayload)
    .select("id, order_number, status, total, created_at")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Failed to create order" }, { status: 500 });
  }

  // Lookup product IDs and weight IDs for items without them (for stock tracking)
  const itemsNeedingLookup = items.filter((i) => !i.product_id || !i.product_weight_id);

  let weightIdMap: Record<string, Record<string, string>> = {};
  if (itemsNeedingLookup.length > 0) {
    const productLookup = await supabase
      .from("products")
      .select("id, name, weights:product_weights(id, label)")
      .in("name", itemsNeedingLookup.map((i) => i.product_name));

    const { data: productsWithWeights } = productLookup;
    if (productsWithWeights && Array.isArray(productsWithWeights)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productsWithWeights.forEach((product: any) => {
        weightIdMap[product.name] = {};
        (product.weights ?? []).forEach((w: { id: string; label: string }) => {
          weightIdMap[product.name][w.label] = w.id;
        });
      });
    }
  }

  // Insert order items with proper IDs for stock decrement
  const orderItems = items.map((item) => {
    const productId = item.product_id ?? null;
    let productWeightId = item.product_weight_id ?? null;

    // Lookup weight ID if not provided
    if (!productWeightId && weightIdMap[item.product_name]?.[item.weight_label]) {
      productWeightId = weightIdMap[item.product_name][item.weight_label];
    }

    return {
      order_id: order.id,
      product_id: productId,
      product_weight_id: productWeightId,
      product_name: item.product_name,
      weight_label: item.weight_label,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Auto-create Shiprocket order for COD (best-effort — never blocks the response)
  if (isCod && process.env.SHIPROCKET_EMAIL) {
    try {
      const totalWeight = items.reduce(
        (sum, item) => sum + parseWeightKg(item.weight_label) * item.quantity,
        0
      );
      const orderDate = new Date(order.created_at)
        .toISOString()
        .replace("T", " ")
        .slice(0, 16);

      const srResult = await createShiprocketOrder({
        order_number: order.order_number,
        order_date: orderDate,
        customer_name,
        customer_email,
        customer_phone,
        address: shipping_address.address,
        city: shipping_address.city,
        state: shipping_address.state,
        pincode: shipping_address.pincode,
        items: items.map((item) => ({
          name: item.product_name,
          sku: item.product_name.toLowerCase().replace(/\s+/g, "-"),
          units: item.quantity,
          selling_price: item.unit_price,
        })),
        subtotal,
        shipping_charges: shipping_cost,
        weight_kg: Math.max(totalWeight, 0.1),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const srUpdate: Record<string, any> = {
        shiprocket_order_id: srResult.order_id,
        shiprocket_shipment_id: srResult.shipment_id,
      };
      if (srResult.awb_code) srUpdate.awb_code = srResult.awb_code;
      if (srResult.courier_name) srUpdate.courier_name = srResult.courier_name;
      if (srResult.tracking_url) srUpdate.tracking_url = srResult.tracking_url;
      if (srResult.label_url) srUpdate.label_url = srResult.label_url;

      await supabase.from("orders").update(srUpdate).eq("id", order.id);
    } catch (err) {
      console.error("[Shiprocket] COD order creation failed:", err);
    }
  }

  return NextResponse.json({ data: order }, { status: 201 });
}

// GET /api/orders?email=customer@email.com
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, subtotal, shipping_cost, total,
      payment_status, payment_method, created_at,
      order_items(id, product_name, weight_label, quantity, unit_price, total_price)
    `
    )
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
