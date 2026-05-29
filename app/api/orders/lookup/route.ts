export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/orders/lookup?q=<query>
//
// Used by the customer chatbot. `q` can be:
//   - An order number (WMP-A12345, numeric ID, UUID, etc.)
//   - A customer phone number (10 digits, with or without country code / spaces / dashes)
//
// Returns up to 5 most-recent matching orders.
// Public-facing — returns only the limited fields the chatbot displays.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Strip everything but digits to detect a phone-number-like input.
  const digits = q.replace(/\D/g, "");
  const looksLikePhone = digits.length >= 7 && /[\d\s+\-()]+/.test(q) && !/[a-zA-Z]/.test(q);

  const SELECT = `
    id, order_number, customer_name, customer_phone, status, total,
    awb_code, courier_name, created_at, shipping_address,
    items:order_items(product_name, weight_label, quantity)
  `;

  let rows: unknown[] = [];

  // Confirmed orders only (no pending / unpaid). The chatbot doesn't surface
  // payment-pending orders to avoid confusing customers about half-finished checkouts.
  const CONFIRMED_STATUSES = [
    "confirmed",
    "pickup",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (looksLikePhone) {
    // Match on the last 10 digits — handles +91-prefixed and unprefixed phones.
    const last10 = digits.slice(-10);
    const { data } = await supabase
      .from("orders")
      .select(SELECT)
      .ilike("customer_phone", `%${last10}%`)
      .in("status", CONFIRMED_STATUSES)
      .order("created_at", { ascending: false })
      .limit(5);
    rows = data ?? [];
  }

  // If nothing matched as phone, try as an order identifier (order_number or UUID).
  if (rows.length === 0) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
    const baseQuery = supabase
      .from("orders")
      .select(SELECT)
      .in("status", CONFIRMED_STATUSES);
    const { data } = isUuid
      ? await baseQuery.eq("id", q).limit(1)
      : await baseQuery.eq("order_number", q).limit(1);
    rows = data ?? [];
  }

  return NextResponse.json({ data: rows });
}
