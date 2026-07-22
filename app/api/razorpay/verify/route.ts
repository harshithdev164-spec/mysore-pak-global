export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import crypto from "crypto";
import { runPostPaymentHooks } from "@/lib/orders/post-payment-hooks";

// POST /api/razorpay/verify
//
// Fast-path called by the browser after Razorpay Checkout's success handler.
// Marks the order paid + fires all post-payment side effects (stock,
// WhatsApp, email, courier). The webhook at /api/razorpay/webhook fires the
// SAME hooks on Razorpay's schedule so nothing is lost if the browser closes.
export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  let body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    db_order_id: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Mark order as paid + confirmed. Idempotent: harmless if already paid.
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      notes: `razorpay_payment_id:${razorpay_payment_id} | source:verify`,
    })
    .eq("id", db_order_id)
    .select("order_number")
    .single();

  if (error || !data) {
    console.error("[verify] update failed:", error?.message);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  console.log(`[verify] ${data.order_number} marked paid via browser handler`);

  // Fire all post-payment hooks. Idempotent — safe if the webhook fires
  // afterwards. Runs synchronously so the response includes a report the
  // client can act on, but individual failures never abort. Never throws.
  try {
    const report = await runPostPaymentHooks(db_order_id);
    return NextResponse.json({
      success: true,
      order_number: data.order_number,
      hooks: report,
    });
  } catch (err) {
    // runPostPaymentHooks should never throw, but belt-and-suspenders.
    console.error("[verify] hooks threw:", err);
    return NextResponse.json({ success: true, order_number: data.order_number });
  }
}
