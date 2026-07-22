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

/**
 * Send the `admin_login_otp` authentication template. This template was
 * submitted + auto-approved via Graph API on 2026-07-11 with:
 *   - BODY.add_security_recommendation = true (auto body text)
 *   - FOOTER.code_expiration_minutes = 5
 *   - BUTTONS[0] = { type: OTP, otp_type: COPY_CODE, text: "Copy code" }
 *
 * The code goes as a body parameter AND as the button parameter (Meta
 * requires the copy-code button to know the value to copy).
 */
export async function sendAdminOtpTemplate(opts: {
  to: string;
  code: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isWhatsAppConfigured()) return { ok: false, error: "WhatsApp not configured" };
  const templateName = process.env.WHATSAPP_ADMIN_OTP_TEMPLATE ?? "admin_login_otp";
  try {
    await sendWhatsAppTemplate(opts.to, {
      name: templateName,
      language: "en",
      components: [
        { type: "body", parameters: [{ type: "text", text: opts.code }] },
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [{ type: "text", text: opts.code }],
        },
      ],
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[whatsapp] admin_login_otp send failed:", message);
    return { ok: false, error: message };
  }
}

// Build a courier-specific public tracking URL from name + awb. Always
// the courier's OFFICIAL tracking page so customers don't bounce through
// a third party.
export function trackingUrlFor(courier: string | null, awb: string): string {
  const c = (courier ?? "").toLowerCase();
  if (c.includes("dtdc"))
    return `https://www.dtdc.com/track-your-shipment/?strCnno=${awb}`;
  if (c.includes("dhl"))
    return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${awb}`;
  if (c.includes("delhivery")) return `https://www.delhivery.com/tracking?id=${awb}`;
  // Generic fallback — DTDC's page accepts any AWB shape.
  return `https://www.dtdc.com/track-your-shipment/?strCnno=${awb}`;
}
