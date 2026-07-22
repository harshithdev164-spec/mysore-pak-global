// ── sendOrderConfirmation ─────────────────────────────────────────────────
//
// Loads a paid order from Supabase, builds the confirmation email, ships it
// via ZeptoMail, and stamps confirmation_email_sent_at on the row. Called
// from /api/razorpay/verify (fresh checkouts) and /api/admin/orders/[id]/
// resend-confirmation (support resends).
//
// Design contract: NEVER throws. Always returns a result object. Failures
// are logged, not propagated — an email problem must never break payment
// verification.

import { createAdminClient } from "@/lib/supabase";
import { isZeptoMailConfigured, sendZeptoMail } from "@/lib/zeptomail";
import { renderOrderConfirmationEmail, type OrderConfirmationData } from "@/lib/emails/order-confirmation";

export interface SendConfirmationResult {
  ok: boolean;
  skipped?: "not_configured" | "already_sent" | "no_email" | "not_found";
  error?: string;
  request_id?: string;
}

interface Options {
  /** Set to true when the admin explicitly clicks "Resend". Bypasses the
   *  already-sent dedup so we can re-fire on demand. */
  force?: boolean;
}

export async function sendOrderConfirmation(
  orderId: string,
  opts: Options = {}
): Promise<SendConfirmationResult> {
  if (!isZeptoMailConfigured()) {
    return { ok: false, skipped: "not_configured" };
  }

  const supabase = createAdminClient();

  // Fetch the order + items in one round-trip
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email,
      subtotal, shipping_cost, discount, total,
      shipping_address, created_at, awb_code, courier_name,
      confirmation_email_sent_at,
      items:order_items(product_name, weight_label, quantity, unit_price)
    `)
    .eq("id", orderId)
    .single();

  if (error || !data) {
    console.error("[email] order fetch failed", orderId, error?.message);
    return { ok: false, skipped: "not_found", error: error?.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;

  if (!opts.force && row.confirmation_email_sent_at) {
    return { ok: true, skipped: "already_sent" };
  }
  if (!row.customer_email) {
    return { ok: false, skipped: "no_email" };
  }

  const emailData: OrderConfirmationData = {
    order_number: row.order_number,
    customer_name: row.customer_name ?? "Customer",
    customer_email: row.customer_email,
    items: (row.items ?? []).map((it: {
      product_name: string; weight_label: string; quantity: number; unit_price: number;
    }) => ({
      product_name: it.product_name,
      weight_label: it.weight_label,
      quantity: it.quantity,
      unit_price: Number(it.unit_price),
    })),
    subtotal: Number(row.subtotal ?? 0),
    shipping_cost: Number(row.shipping_cost ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total ?? 0),
    shipping_address: row.shipping_address ?? {},
    created_at: row.created_at,
    awb_code: row.awb_code,
    courier_name: row.courier_name,
  };

  const { subject, html, text } = renderOrderConfirmationEmail(emailData);

  const result = await sendZeptoMail({
    to: { email: row.customer_email, name: row.customer_name },
    subject,
    htmlBody: html,
    textBody: text,
  });

  if (!result.ok) {
    console.error("[email] ZeptoMail send failed", row.order_number, result.error);
    return { ok: false, error: result.error };
  }

  // Stamp the row so the admin dashboard reflects the send and duplicate
  // triggers (e.g. Razorpay webhook after verify) noop-out.
  await supabase
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId);

  return { ok: true, request_id: result.request_id };
}
