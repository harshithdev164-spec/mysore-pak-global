/**
 * Helpers for the 3 pre-approved templates submitted to Meta:
 *   - order_confirmed:  {{1}}=name {{2}}=order# {{3}}=total
 *   - order_shipped:    {{1}}=name {{2}}=order# {{3}}=courier {{4}}=awb {{5}}=tracking_url
 *   - order_delivered:  {{1}}=name {{2}}=order#
 *
 * Each helper is best-effort — it never throws. If WhatsApp isn't configured,
 * the template isn't approved yet, or Meta rejects (e.g. recipient not in test
 * list while app is unpublished), we log and move on. The order/courier flow
 * must not be blocked by WhatsApp delivery.
 */

import { sendWhatsAppTemplate, isWhatsAppConfigured } from "@/lib/whatsapp";

type Param = { type: "text"; text: string };

function textParams(...values: string[]): { type: "body"; parameters: Param[] } {
  return {
    type: "body",
    parameters: values.map((v) => ({ type: "text", text: v ?? "" })),
  };
}

export async function sendOrderConfirmedTemplate(opts: {
  to: string;
  customer_name: string;
  order_number: string;
  total: number | string;
}): Promise<void> {
  if (!isWhatsAppConfigured()) return;
  try {
    await sendWhatsAppTemplate(opts.to, {
      name: "order_confirmed",
      language: "en",
      components: [
        textParams(opts.customer_name, opts.order_number, String(opts.total)),
      ],
    });
  } catch (err) {
    console.error("[whatsapp] order_confirmed send failed:", err);
  }
}

export async function sendOrderShippedTemplate(opts: {
  to: string;
  customer_name: string;
  order_number: string;
  courier: string;
  awb: string;
  tracking_url: string;
}): Promise<void> {
  if (!isWhatsAppConfigured()) return;
  try {
    await sendWhatsAppTemplate(opts.to, {
      name: "order_shipped",
      language: "en",
      components: [
        textParams(
          opts.customer_name,
          opts.order_number,
          opts.courier,
          opts.awb,
          opts.tracking_url,
        ),
      ],
    });
  } catch (err) {
    console.error("[whatsapp] order_shipped send failed:", err);
  }
}

export async function sendOrderDeliveredTemplate(opts: {
  to: string;
  customer_name: string;
  order_number: string;
}): Promise<void> {
  if (!isWhatsAppConfigured()) return;
  try {
    await sendWhatsAppTemplate(opts.to, {
      name: "order_delivered",
      language: "en",
      components: [textParams(opts.customer_name, opts.order_number)],
    });
  } catch (err) {
    console.error("[whatsapp] order_delivered send failed:", err);
  }
}

// Build a courier-specific public tracking URL from name + awb.
export function trackingUrlFor(courier: string | null, awb: string): string {
  const c = (courier ?? "").toLowerCase();
  if (c.includes("dtdc")) return `https://trackcourier.io/track-and-trace/dtdc/${awb}`;
  if (c.includes("dhl")) return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${awb}`;
  if (c.includes("delhivery")) return `https://www.delhivery.com/tracking?id=${awb}`;
  return `https://trackcourier.io/?awb=${awb}`;
}
