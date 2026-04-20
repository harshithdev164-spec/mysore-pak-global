export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/orders — fetch all orders for admin panel with pagination + search
// Query params:
//   - status: filter by order status (default "all")
//   - search: search by order_number, customer_name, email, or phone
//   - page: page number, 1-indexed (default 1)
//   - page_size: rows per page (default 50, max 500)
export async function GET(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    500,
    Math.max(1, parseInt(searchParams.get("page_size") || "50", 10))
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, customer_phone, total, subtotal, shipping_cost, discount, status, payment_status, payment_method, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    // Escape commas/parens that would break PostgREST's `or` filter syntax
    const safe = search.replace(/[,()]/g, " ");
    query = query.or(
      `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%,customer_phone.ilike.%${safe}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({
    data,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: totalPages,
    },
  });
}
