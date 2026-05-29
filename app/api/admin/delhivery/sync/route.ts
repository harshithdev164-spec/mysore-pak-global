export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getDelhiveryTracking } from "@/lib/delhivery";

// Maps Delhivery's `Status.Status` string to our internal order status.
// Delhivery canonical values include: Manifested, Not Picked, In Transit, Dispatched,
// Out for Delivery, Delivered, RTO, Cancelled. We bucket into our pipeline:
//   pickup   — manifested / not yet picked
//   shipped  — anything in the transit or out-for-delivery phase
//   delivered — confirmed delivered
//   cancelled — cancelled / RTO
function mapDelhiveryStatus(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("deliver") && !s.includes("out")) return "delivered";
  if (
    s.includes("transit") ||
    s.includes("dispatch") ||
    s.includes("out for delivery") ||
    s.includes("picked")
  )
    return "shipped";
  if (s.includes("cancel") || s.includes("rto")) return "cancelled";
  if (s.includes("manifest") || s.includes("not picked") || s.includes("pending")) return "pickup";
  return null;
}

// POST /api/admin/delhivery/sync
// Body (optional): { order_id: string }
//   - If order_id provided → sync just that one order
//   - Otherwise → sync all orders currently in status pickup/shipped with a waybill
export async function POST(request: Request) {
  const supabase = createAdminClient();

  let body: { order_id?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — means sync-all
  }

  // awb_code is the universal AWB column (Delhivery + DHL both write to it).
  // We restrict to domestic orders by checking shipping_address->>country.
  let query = supabase
    .from("orders")
    .select("id, order_number, status, awb_code, shipping_address")
    .not("awb_code", "is", null);

  if (body.order_id) {
    query = query.eq("id", body.order_id);
  } else {
    query = query
      .in("status", ["pickup", "shipped"])
      .or("shipping_address->>country.eq.IN,shipping_address->>country.is.null");
  }

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ synced: 0, updated: 0, orders: [] });
  }

  let updated = 0;
  const results: Array<{ order_number: string; from: string; to: string | null; raw?: string }> = [];

  for (const o of orders) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tracking: any = await getDelhiveryTracking(o.awb_code as string);
      const shipment = tracking?.ShipmentData?.[0]?.Shipment;
      const raw = shipment?.Status?.Status ?? shipment?.Status?.StatusType;
      const mapped = mapDelhiveryStatus(raw);

      if (mapped && mapped !== o.status) {
        await supabase.from("orders").update({ status: mapped }).eq("id", o.id);
        updated++;
        results.push({ order_number: o.order_number, from: o.status, to: mapped, raw });
      } else {
        results.push({ order_number: o.order_number, from: o.status, to: null, raw });
      }
    } catch (err) {
      console.error(`[Delhivery sync] ${o.order_number} failed:`, err);
      results.push({ order_number: o.order_number, from: o.status, to: null });
    }
  }

  return NextResponse.json({ synced: orders.length, updated, orders: results });
}
