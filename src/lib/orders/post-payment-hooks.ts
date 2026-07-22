// ── runPostPaymentHooks ───────────────────────────────────────────────────
//
// Single idempotent function that fires ALL side effects triggered by a
// paid order:
//   1. Decrement stock (one-time — guarded by notes flag)
//   2. Send WhatsApp "order confirmed" template (dedup by whatsapp_confirmation_sent_at)
//   3. Send ZeptoMail order confirmation (dedup by confirmation_email_sent_at)
//   4. Auto-create courier shipment (dedup by awb_code existence)
//
// Called from BOTH:
//   - /api/razorpay/verify — fast-path when browser stays open
//   - /api/razorpay/webhook — reliable-path when browser closes
//
// Design contract: every step is best-effort. Failure of one step logs
// with a clear prefix and does NOT abort subsequent steps. The function
// never throws — payment success responses must not depend on this.

import { createAdminClient } from "@/lib/supabase";
import {
  sendOrderConfirmedTemplate,
  sendOrderShippedTemplate,
  trackingUrlFor,
} from "@/lib/whatsapp-templates";
import { sendOrderConfirmation } from "@/lib/emails/send-order-confirmation";
import { createDelhiveryOrder, parseWeightKg } from "@/lib/delhivery";
import { createDhlShipment, isDhlConfigured } from "@/lib/dhl";
import { HS_CODE_SWEETS } from "@/lib/countries";

export interface PostPaymentReport {
  order_id: string;
  order_number?: string;
  stock_decremented: boolean | "already";
  whatsapp_sent: boolean | "already" | "skipped_no_phone";
  email_sent: boolean | "already" | "skipped_no_email" | "skipped_not_configured";
  courier_created: boolean | "already" | "skipped";
  courier_provider?: string;
  awb?: string;
  errors: Record<string, string>;
}

export async function runPostPaymentHooks(orderId: string): Promise<PostPaymentReport> {
  const report: PostPaymentReport = {
    order_id: orderId,
    stock_decremented: false,
    whatsapp_sent: false,
    email_sent: false,
    courier_created: false,
    errors: {},
  };

  const supabase = createAdminClient();

  // Pull everything we need in one round-trip
  const { data, error: fetchErr } = await supabase
    .from("orders")
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, discount, total, courier_id,
      shipping_address, created_at, payment_status,
      awb_code, courier_name,
      confirmation_email_sent_at, whatsapp_confirmation_sent_at,
      notes,
      items:order_items(id, product_name, weight_label, quantity, unit_price, product_weight_id)
    `)
    .eq("id", orderId)
    .single();

  if (fetchErr || !data) {
    report.errors.fetch = fetchErr?.message ?? "order not found";
    console.error(`[post-payment ${orderId}] fetch failed`, fetchErr?.message);
    return report;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const order = data as any;
  report.order_number = order.order_number;

  if (order.payment_status !== "paid") {
    report.errors.status = `order is ${order.payment_status}, expected paid`;
    console.warn(`[post-payment ${order.order_number}] skipping — payment_status=${order.payment_status}`);
    return report;
  }

  // ── 1. Stock decrement (idempotent via a marker in notes) ──────────────
  const notes: string = order.notes ?? "";
  if (notes.includes("stock_decremented:1")) {
    report.stock_decremented = "already";
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of (order.items ?? []) as any[]) {
        const weightId = item.product_weight_id;
        const qty = item.quantity ?? 1;
        if (!weightId) continue;
        const { data: weight } = await supabase
          .from("product_weights")
          .select("stock_quantity")
          .eq("id", weightId)
          .single();
        if (weight) {
          const newStock = Math.max(0, (weight.stock_quantity ?? 0) - qty);
          await supabase
            .from("product_weights")
            .update({ stock_quantity: newStock })
            .eq("id", weightId);
        }
      }
      // Mark done via notes so we don't decrement again on re-fire
      await supabase
        .from("orders")
        .update({ notes: (notes ? notes + " | " : "") + "stock_decremented:1" })
        .eq("id", orderId);
      report.stock_decremented = true;
      console.log(`[post-payment ${order.order_number}] stock decremented`);
    } catch (err) {
      report.errors.stock = err instanceof Error ? err.message : String(err);
      console.error(`[post-payment ${order.order_number}] stock decrement failed:`, err);
    }
  }

  // ── 2. WhatsApp order confirmed ────────────────────────────────────────
  if (order.whatsapp_confirmation_sent_at) {
    report.whatsapp_sent = "already";
  } else if (!order.customer_phone) {
    report.whatsapp_sent = "skipped_no_phone";
  } else {
    try {
      await sendOrderConfirmedTemplate({
        to: order.customer_phone,
        customer_name: (order.customer_name ?? "").split(" ")[0] || "there",
        order_number: order.order_number,
        total: Math.round(Number(order.total ?? 0)),
      });
      await supabase
        .from("orders")
        .update({ whatsapp_confirmation_sent_at: new Date().toISOString() })
        .eq("id", orderId);
      report.whatsapp_sent = true;
      console.log(`[post-payment ${order.order_number}] whatsapp sent to ${order.customer_phone}`);
    } catch (err) {
      report.errors.whatsapp = err instanceof Error ? err.message : String(err);
      console.error(`[post-payment ${order.order_number}] whatsapp failed:`, err);
    }
  }

  // ── 3. Email confirmation via ZeptoMail ────────────────────────────────
  try {
    const emailResult = await sendOrderConfirmation(orderId);
    if (emailResult.ok) {
      report.email_sent = emailResult.skipped === "already_sent" ? "already" : true;
      if (emailResult.skipped === "already_sent") {
        console.log(`[post-payment ${order.order_number}] email already sent`);
      } else {
        console.log(`[post-payment ${order.order_number}] email sent to ${order.customer_email}`);
      }
    } else {
      if (emailResult.skipped === "not_configured") {
        report.email_sent = "skipped_not_configured";
      } else if (emailResult.skipped === "no_email") {
        report.email_sent = "skipped_no_email";
      } else {
        report.errors.email = emailResult.error ?? "unknown";
      }
      console.error(`[post-payment ${order.order_number}] email:`, emailResult.error ?? emailResult.skipped);
    }
  } catch (err) {
    report.errors.email = err instanceof Error ? err.message : String(err);
    console.error(`[post-payment ${order.order_number}] email threw:`, err);
  }

  // ── 4. Courier auto-create ─────────────────────────────────────────────
  if (order.awb_code) {
    report.courier_created = "already";
    report.awb = order.awb_code;
    report.courier_provider = order.courier_name ?? undefined;
  } else {
    try {
      const created = await createCourierShipment(order, supabase);
      if (created) {
        report.courier_created = true;
        report.courier_provider = created.courier;
        report.awb = created.awb;
        console.log(`[post-payment ${order.order_number}] ${created.courier} shipment created: ${created.awb}`);
      } else {
        report.courier_created = "skipped";
      }
    } catch (err) {
      report.errors.courier = err instanceof Error ? err.message : String(err);
      console.error(`[post-payment ${order.order_number}] courier failed:`, err);
    }
  }

  return report;
}

// ── Courier auto-create (internal helper) ────────────────────────────────
// Extracted from the old inline block in /api/razorpay/verify. Chooses
// courier based on order.courier_id.
//   200 → DTDC (domestic)
//   100 → DHL Express (international)
//   any other → Delhivery (fallback for both)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createCourierShipment(order: any, supabase: ReturnType<typeof createAdminClient>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addr = (order.shipping_address ?? {}) as Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = (order.items ?? []) as any[];

  const country = String(addr.country ?? "IN").toUpperCase();
  const courierId = order.courier_id ?? 1;

  const totalWeight = orderItems.reduce(
    (sum: number, item: { weight_label: string; quantity: number }) => {
      return sum + parseWeightKg(item.weight_label) * item.quantity;
    },
    0
  );

  const useDhl = courierId === 100 && country !== "IN" && isDhlConfigured();
  const useDtdc = courierId === 200;

  if (useDtdc) {
    const { createDtdcOrder } = await import("@/lib/dtdc");
    const dtdcResult = await createDtdcOrder({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? addr.postal_code ?? "",
      items: orderItems.map((item) => ({
        name: item.product_name,
        units: item.quantity,
        selling_price: item.unit_price,
      })),
      subtotal: order.subtotal,
      shipping_charges: order.shipping_cost ?? 0,
      weight_kg: Math.max(totalWeight, 0.5),
      payment_method: "Prepaid",
    });

    const dbUpdate: Record<string, unknown> = { courier_name: "DTDC Express" };
    if (dtdcResult.reference_number) {
      dbUpdate.awb_code = dtdcResult.reference_number;
      dbUpdate.status = "pickup";
    }
    await supabase.from("orders").update(dbUpdate).eq("id", order.id);
    return { courier: "DTDC Express", awb: dtdcResult.reference_number ?? "" };
  }

  if (useDhl) {
    const dhlResult = await createDhlShipment({
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      address2: addr.address2,
      city: addr.city ?? "",
      state: addr.state ?? "",
      postal_code: addr.postal_code ?? addr.pincode ?? "",
      country,
      items: orderItems.map((item) => ({
        name: item.product_name,
        sku: `${item.product_name.toLowerCase().replace(/\s+/g, "-")}-${item.weight_label.toLowerCase().replace(/\s+/g, "")}`,
        units: item.quantity,
        selling_price_inr: item.unit_price,
        weight_kg: parseWeightKg(item.weight_label),
        hs_code: HS_CODE_SWEETS,
      })),
      declared_value_inr: order.subtotal,
      weight_kg: Math.max(totalWeight, 0.5),
      payment_method: "Prepaid",
    });

    const dbUpdate: Record<string, unknown> = { courier_name: "DHL Express" };
    if (dhlResult.tracking_number) {
      dbUpdate.awb_code = dhlResult.tracking_number;
      dbUpdate.status = "pickup";
    }
    await supabase.from("orders").update(dbUpdate).eq("id", order.id);

    if (dhlResult.tracking_number) {
      try {
        await sendOrderShippedTemplate({
          to: order.customer_phone,
          customer_name: (order.customer_name ?? "").split(" ")[0] || "there",
          order_number: order.order_number,
          courier: "DHL Express",
          awb: dhlResult.tracking_number,
          tracking_url: trackingUrlFor("DHL Express", dhlResult.tracking_number),
        });
      } catch { /* WhatsApp best-effort */ }
    }
    return { courier: "DHL Express", awb: dhlResult.tracking_number ?? "" };
  }

  if (process.env.DELHIVERY_TOKEN) {
    const orderDate = new Date(order.created_at)
      .toISOString().replace("T", " ").slice(0, 16);

    const delResult = await createDelhiveryOrder({
      order_number: order.order_number,
      order_date: orderDate,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: addr.address ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? addr.postal_code ?? "",
      country,
      items: orderItems.map((item) => ({
        name: item.product_name,
        sku: `${item.product_name.toLowerCase().replace(/\s+/g, "-")}-${item.weight_label.toLowerCase().replace(/\s+/g, "")}`,
        units: item.quantity,
        selling_price: item.unit_price,
      })),
      subtotal: order.subtotal,
      shipping_charges: order.shipping_cost ?? 0,
      weight_kg: Math.max(totalWeight, 0.1),
      payment_method: "Prepaid",
    });

    const dbUpdate: Record<string, unknown> = { courier_name: "Delhivery" };
    if (delResult.waybill) {
      dbUpdate.awb_code = delResult.waybill;
      dbUpdate.status = "pickup";
    }
    await supabase.from("orders").update(dbUpdate).eq("id", order.id);

    if (delResult.waybill) {
      try {
        await sendOrderShippedTemplate({
          to: order.customer_phone,
          customer_name: (order.customer_name ?? "").split(" ")[0] || "there",
          order_number: order.order_number,
          courier: "Delhivery",
          awb: delResult.waybill,
          tracking_url: trackingUrlFor("Delhivery", delResult.waybill),
        });
      } catch { /* WhatsApp best-effort */ }
    }
    return { courier: "Delhivery", awb: delResult.waybill ?? "" };
  }

  return null;
}
