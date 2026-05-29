export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/orders — fetch all orders for admin panel with pagination + search
// Query params:
//   - status: filter by order status (default "all"); comma-separated for multi-status
//   - country: "intl" → only international orders; ISO-2 code → only that country; "IN" → only domestic
//   - search: search by order_number, customer_name, email, or phone
//   - page: page number, 1-indexed (default 1)
//   - page_size: rows per page (default 50, max 500)
export async function GET(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const country = searchParams.get("country")?.trim().toUpperCase() ?? "";
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    500,
    Math.max(1, parseInt(searchParams.get("page_size") || "50", 10))
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // NOTE: country lives inside `shipping_address` JSONB. The denormalized
  // `shipping_country` column from add_dhl_columns.sql is optional (just an index
  // optimization) — we don't depend on it here, so the admin page works even if
  // the migration hasn't been run yet.
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, customer_phone, total, subtotal, shipping_cost, discount, status, payment_status, payment_method, shipping_address, awb_code, courier_name, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    // Support comma-separated multi-status (e.g. "shipped,delivered" for Fulfilled)
    const values = status.split(",").map((s) => s.trim()).filter(Boolean);
    if (values.length === 1) {
      query = query.eq("status", values[0]);
    } else if (values.length > 1) {
      query = query.in("status", values);
    }
  }

  // Country filter via JSONB extraction. (Legacy orders may have NULL country —
  // those are domestic by definition, since intl-checkout writes 'country' explicitly.)
  if (country === "INTL") {
    query = query.neq("shipping_address->>country", "IN"); // neq also excludes NULLs
  } else if (country === "IN") {
    query = query.or(
      "shipping_address->>country.eq.IN,shipping_address->>country.is.null"
    );
  } else if (country.length === 2) {
    query = query.eq("shipping_address->>country", country);
  }

  if (search) {
    // Escape commas/parens that would break PostgREST's `or` filter syntax
    const safe = search.replace(/[,()]/g, " ");
    query = query.or(
      `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_email.ilike.%${safe}%,customer_phone.ilike.%${safe}%`
    );
  }

  // Date range filter — used by the Invoices bulk page.
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");
  if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00`);
  if (toDate)   query = query.lte("created_at", `${toDate}T23:59:59`);

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
