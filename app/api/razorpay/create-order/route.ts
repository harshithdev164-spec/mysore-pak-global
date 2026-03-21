export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";

const OrderItemSchema = z.object({
  product_name: z.string().min(1),
  weight_label: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

const BodySchema = z.object({
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
  notes: z.string().optional(),
  // Shiprocket: actual shipping cost + selected courier from checkout
  shipping_cost: z.number().min(0).optional(),
  courier_id: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const { customer_name, customer_email, customer_phone, shipping_address, items, notes, courier_id } =
    parsed.data;

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  // Use Shiprocket-provided rate if available; fallback to threshold logic
  const shipping_cost =
    parsed.data.shipping_cost !== undefined
      ? parsed.data.shipping_cost
      : subtotal > 1500
      ? 0
      : 99;
  const total = subtotal + shipping_cost;
  const order_number = `WMP-${Date.now().toString(36).toUpperCase()}`;

  // 1. Create the DB order first (payment_status: pending)
  const supabase = createServerClient();

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
    payment_method: "razorpay",
    payment_status: "pending",
    shipping_address,
    notes: notes ?? null,
    status: "pending",
  };
  if (courier_id !== undefined) insertPayload.courier_id = courier_id;

  const { data: dbOrder, error: dbError } = await supabase
    .from("orders")
    .insert(insertPayload)
    .select("id, order_number")
    .single();

  if (dbError || !dbOrder) {
    return NextResponse.json({ error: dbError?.message ?? "Failed to create order" }, { status: 500 });
  }

  // Insert order items
  await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: dbOrder.id,
      product_name: item.product_name,
      weight_label: item.weight_label,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }))
  );

  // 2. Create Razorpay order
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: dbOrder.id,
      notes: { order_number: dbOrder.order_number },
    }),
  });

  if (!rzpRes.ok) {
    const err = await rzpRes.json().catch(() => ({}));
    return NextResponse.json({ error: "Razorpay order creation failed", details: err }, { status: 502 });
  }

  const rzpOrder = await rzpRes.json();

  return NextResponse.json({
    razorpay_order_id: rzpOrder.id,
    key_id: keyId,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    db_order_id: dbOrder.id,
    order_number: dbOrder.order_number,
  });
}
