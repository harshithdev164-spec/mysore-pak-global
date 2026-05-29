export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getDhlTracking } from "@/lib/dhl";

// Maps DHL Express's `status` string into our internal pipeline.
//   pickup   — manifested / not picked up yet
//   shipped  — anything in transit / out for delivery
//   delivered — confirmed delivered
//   processing — held by customs (admin-visible flag, manual action needed)
//   cancelled — returned / failed
function mapDhlStatus(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("delivered") && !s.includes("out for")) return "delivered";
  if (
    s.includes("transit") ||
    s.includes("departed") ||
    s.includes("arrived") ||
    s.includes("processed at") ||
    s.includes("clearance") ||
    s.includes("out for delivery") ||
    s.includes("with delivery courier") ||
    s.includes("picked up")
  ) {
    if (s.includes("held") || s.includes("clearance delay")) return "processing";
    return "shipped";
  }
  if (s.includes("held") || s.includes("hold")) return "processing";
  if (s.includes("returned") || s.includes("failed") || s.includes("undelivered"))
    return "cancelled";
  if (s.includes("manifest") || s.includes("pre-transit") || s.includes("created"))
    return "pickup";
  return null;
}

// POST /api/admin/dhl/sync
// Body (optional): { order_id: string }
//   - If order_id provided → sync just that one international order
//   - Otherwise → sync all intl orders currently in pickup/shipped status
export async function POST(request: Request) {
  const supabase = createAdminClient();

  let body: { order_id?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — sync all
  }

  // awb_code carries the DHL tracking number for intl orders (we no longer
  // depend on the optional dhl_tracking_number column).
  let query = supabase
    .from("orders")
    .select("id, order_number, status, awb_code, shipping_address")
    .not("awb_code", "is", null);

  if (body.order_id) {
    query = query.eq("id", body.order_id);
  } else {
    // International only: country in JSONB is non-null and non-IN.
    query = query
      .in("status", ["pickup", "shipped"])
      .neq("shipping_address->>country", "IN");
  }

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ synced: 0, updated: 0, orders: [] });
  }

  let updated = 0;
  const results: Array<{
    order_number: string;
    from: string;
    to: string | null;
    raw?: string;
  }> = [];

  for (const o of orders) {
    try {
      const tracking = await getDhlTracking(o.awb_code as string);
      const raw = tracking?.raw_status;
      const mapped = mapDhlStatus(raw);

      if (mapped && mapped !== o.status) {
        await supabase.from("orders").update({ status: mapped }).eq("id", o.id);
        updated++;
        results.push({ order_number: o.order_number, from: o.status, to: mapped, raw });
      } else {
        results.push({ order_number: o.order_number, from: o.status, to: null, raw });
      }
    } catch (err) {
      console.error(`[DHL sync] ${o.order_number} failed:`, err);
      results.push({ order_number: o.order_number, from: o.status, to: null });
    }
  }

  return NextResponse.json({ synced: orders.length, updated, orders: results });
}
