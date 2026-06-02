export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase";

// POST /api/razorpay/webhook
//
// Server-to-server payment confirmation from Razorpay. The browser-side verify
// route (/api/razorpay/verify) only fires if the customer's tab stays open
// after payment; if they close it / lose connection, the order stays
// payment_status=pending even though Razorpay captured the money. This
// webhook fixes that: Razorpay calls it directly when payment is captured,
// regardless of browser state.
//
// Setup: in Razorpay Dashboard → Settings → Webhooks → Add webhook
//   URL:     https://<your-domain>/api/razorpay/webhook
//   Secret:  RAZORPAY_WEBHOOK_SECRET (set in env)
//   Events:  payment.captured, order.paid
export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[rzp webhook] RAZORPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  // Razorpay signs the raw body with HMAC-SHA256. We must hash the bytes
  // exactly as received, so read text() and verify before parsing.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    console.error("[rzp webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event: string = payload?.event ?? "";

  // We only care about events that prove the merchant has the money.
  // Acknowledge everything else with 200 so Razorpay stops retrying.
  if (event !== "payment.captured" && event !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: event });
  }

  const paymentEntity = payload?.payload?.payment?.entity ?? null;
  const orderEntity   = payload?.payload?.order?.entity ?? null;

  // `receipt` is the DB order UUID we set when creating the Razorpay order
  // (see app/api/razorpay/create-order/route.ts). Falls back to order.notes.
  const dbOrderId: string | undefined =
    paymentEntity?.notes?.db_order_id ??
    orderEntity?.receipt ??
    paymentEntity?.receipt ??
    paymentEntity?.notes?.order_id;

  const orderNumberFromNotes: string | undefined =
    paymentEntity?.notes?.order_number ?? orderEntity?.notes?.order_number;

  const razorpayPaymentId: string = paymentEntity?.id ?? "";
  const razorpayOrderId: string = paymentEntity?.order_id ?? orderEntity?.id ?? "";

  const supabase = createAdminClient();

  // Locate the order. Prefer dbOrderId; otherwise fall back to order_number.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let order: any = null;
  if (dbOrderId) {
    const { data } = await supabase
      .from("orders")
      .select("id, payment_status, status")
      .eq("id", dbOrderId)
      .maybeSingle();
    order = data;
  }
  if (!order && orderNumberFromNotes) {
    const { data } = await supabase
      .from("orders")
      .select("id, payment_status, status")
      .eq("order_number", orderNumberFromNotes)
      .maybeSingle();
    order = data;
  }

  if (!order) {
    console.error("[rzp webhook] order not found", {
      event,
      dbOrderId,
      orderNumberFromNotes,
      razorpayOrderId,
    });
    // Still return 200 so Razorpay stops retrying. The mismatch will be in logs.
    return NextResponse.json({ ok: true, warning: "order not found" });
  }

  // Idempotent: if already paid, just acknowledge.
  if (order.payment_status === "paid") {
    return NextResponse.json({ ok: true, already_paid: true });
  }

  const noteParts = [
    razorpayPaymentId ? `razorpay_payment_id:${razorpayPaymentId}` : "",
    razorpayOrderId ? `razorpay_order_id:${razorpayOrderId}` : "",
    "source:webhook",
  ].filter(Boolean);

  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: order.status === "pending" ? "confirmed" : order.status,
      notes: noteParts.join(" | "),
    })
    .eq("id", order.id);

  if (updateErr) {
    console.error("[rzp webhook] update failed:", updateErr);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  console.log("[rzp webhook] marked paid:", { order_id: order.id, event });
  return NextResponse.json({ ok: true, order_id: order.id, marked_paid: true });
}
