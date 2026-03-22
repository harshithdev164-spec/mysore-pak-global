export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";

// GET /api/orders/:id  (accepts UUID or order_number like WMP-XXXXX)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { id } = params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const baseQuery = supabase
    .from("orders")
    .select(
      `
      id, order_number, customer_name, customer_email, customer_phone,
      status, subtotal, shipping_cost, discount, total,
      payment_method, payment_status, shipping_address, notes, created_at, updated_at,
      awb_code, courier_name, tracking_url,
      items:order_items(
        id, product_name, weight_label, quantity, unit_price, total_price,
        product:products(id, name, slug, image)
      )
    `
    );

  const { data, error } = await (isUuid ? baseQuery.eq("id", id) : baseQuery.eq("order_number", id)).single();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// PATCH /api/orders/:id — update order/payment status (admin)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  const { id } = params;

  let body: { payment_status?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: { payment_status?: string; status?: string } = {};
  if (body.payment_status) updates.payment_status = body.payment_status;
  if (body.status) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("id, order_number, status, payment_status, updated_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Order not found" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
