export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { runPostPaymentHooks } from "@/lib/orders/post-payment-hooks";

// POST /api/internal/run-post-payment-hooks
//
// Internal endpoint called by scripts/reconcile-pending-orders.mjs when
// it discovers an order Razorpay considers paid but our DB missed. Fires
// all post-payment hooks (email, WhatsApp, courier) which are individually
// idempotent.
//
// Auth: shared-secret header. Set RECONCILE_HOOK_SECRET in env to enable.
// Middleware exempts this path from admin session cookies since cron jobs
// don't have cookies.
export async function POST(request: Request) {
  const secret = process.env.RECONCILE_HOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  if (request.headers.get("x-internal-secret") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { order_id?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  if (!body.order_id) {
    return NextResponse.json({ error: "order_id required" }, { status: 400 });
  }

  const report = await runPostPaymentHooks(body.order_id);
  return NextResponse.json({ ok: true, report });
}
