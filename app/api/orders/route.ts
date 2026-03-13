export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";

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
});

// POST /api/orders — create a new order
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

  const { customer_name, customer_email, customer_phone, shipping_address, items, payment_method, notes } =
    parsed.data;

  // Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const shipping_cost = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shipping_cost;

  // Generate human-readable order number
  const order_number = `WMP-${Date.now().toString(36).toUpperCase()}`;

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      subtotal,
      shipping_cost,
      discount: 0,
      total,
      payment_method: payment_method ?? "razorpay",
      payment_status: "pending",
      shipping_address,
      notes: notes ?? null,
      status: "pending",
    })
    .select("id, order_number, status, total, created_at")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Failed to create order" }, { status: 500 });
  }

  // Insert order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id ?? null,
    product_weight_id: item.product_weight_id ?? null,
    product_name: item.product_name,
    weight_label: item.weight_label,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
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
      payment_status, created_at,
      items:order_items(id, product_name, weight_label, quantity, unit_price, total_price)
    `
    )
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
