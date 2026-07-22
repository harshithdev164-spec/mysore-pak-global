// ── Order confirmation email template ─────────────────────────────────────
//
// Table-based HTML because Gmail / Outlook / iOS Mail all still strip flexbox
// and CSS grid, and inline styles are the only reliable way to enforce brand
// colours across clients. Yes it looks like 2010 markup — that's normal for
// email templates in 2026.
//
// Palette (matches the site):
//   #FBF7F0 cream · #1B3A2D deep green · #C9972D gold · #C4512A terracotta

interface OrderItem {
  product_name: string;
  weight_label: string;
  quantity: number;
  unit_price: number;
}

export interface OrderConfirmationData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_address: {
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    pincode?: string;
    country?: string;
  };
  /** ISO timestamp; formatted in-template to "12 Jul 2026, 10:34 AM IST". */
  created_at: string;
  /** Optional courier tracking, shown only if the awb was already generated. */
  awb_code?: string | null;
  courier_name?: string | null;
}

const SITE = "https://www.worldofmysorepak.com";

function inr(n: number): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 } as any)}`;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateIST(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }) + " IST";
  } catch {
    return iso;
  }
}

/**
 * Build the confirmation email — both HTML and plain-text versions.
 */
export function renderOrderConfirmationEmail(o: OrderConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Order confirmed: ${o.order_number} — thank you for choosing World of Mysore Pak`;

  const addr = o.shipping_address ?? {};
  const addressLines = [
    addr.address,
    addr.address2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.postal_code ?? addr.pincode, addr.country].filter(Boolean).join(" "),
  ].filter(Boolean).map((s) => escapeHtml(String(s)));

  const itemRows = o.items.map((it) => {
    const line = it.unit_price * it.quantity;
    return `
      <tr>
        <td style="padding:12px 12px 12px 0;border-bottom:1px solid #E8DFCF;font-family:'Playfair Display',Georgia,serif;font-size:14px;color:#1B3A2D;font-weight:600;line-height:1.35;">
          ${escapeHtml(it.product_name)}
          <div style="font-family:Poppins,Arial,sans-serif;font-size:11px;color:#6B6255;font-weight:400;margin-top:2px;letter-spacing:0.5px;text-transform:uppercase;">
            ${escapeHtml(it.weight_label)} &middot; qty ${it.quantity}
          </div>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #E8DFCF;font-family:Poppins,Arial,sans-serif;font-size:14px;color:#1B3A2D;font-weight:600;white-space:nowrap;vertical-align:top;">
          ${inr(line)}
        </td>
      </tr>`;
  }).join("");

  const trackingBlock = o.awb_code && o.courier_name ? `
    <tr>
      <td style="padding:20px 32px;">
        <div style="background:#FBF7F0;border-radius:10px;padding:16px 20px;">
          <div style="font-family:Poppins,Arial,sans-serif;font-size:11px;color:#C9972D;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
            Tracking
          </div>
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;color:#1B3A2D;font-weight:700;">
            ${escapeHtml(o.courier_name)}
          </div>
          <div style="font-family:Poppins,Arial,sans-serif;font-size:13px;color:#1B3A2D;margin-top:4px;">
            AWB: <strong>${escapeHtml(o.awb_code)}</strong>
          </div>
        </div>
      </td>
    </tr>` : "";

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<meta name="format-detection" content="telephone=no"/>
<meta name="color-scheme" content="light only"/>
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F0EAD8;font-family:Poppins,Arial,Helvetica,sans-serif;color:#1B3A2D;">
<div style="display:none;max-height:0;overflow:hidden;">
  Your order ${escapeHtml(o.order_number)} is confirmed. Total ${inr(o.total)}.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F0EAD8;padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#FBF7F0;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(27,58,45,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1B3A2D;padding:32px;text-align:center;">
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#C9972D;font-weight:700;letter-spacing:1px;">
              World of Mysore Pak
            </div>
            <div style="font-family:Poppins,Arial,sans-serif;font-size:11px;color:#FBF7F0;opacity:0.65;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">
              Traditional sweets from Mysuru
            </div>
          </td>
        </tr>

        <!-- Confirmation title -->
        <tr>
          <td style="padding:36px 32px 8px 32px;text-align:center;">
            <div style="font-family:Poppins,Arial,sans-serif;font-size:12px;color:#C9972D;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">
              Order confirmed
            </div>
            <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:30px;color:#1B3A2D;font-weight:700;margin:0 0 10px 0;line-height:1.15;">
              Thank you, ${escapeHtml((o.customer_name ?? "").split(" ")[0] || "friend")}.
            </h1>
            <p style="font-family:Poppins,Arial,sans-serif;font-size:14px;color:#5A4E3C;margin:0;line-height:1.6;">
              Your order is in our kitchen and we're getting it ready with care.<br/>
              You'll get another email the moment it ships.
            </p>
          </td>
        </tr>

        <!-- Order meta -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#1B3A2D;border-radius:10px;">
              <tr>
                <td style="padding:16px 20px;">
                  <div style="font-family:Poppins,Arial,sans-serif;font-size:10px;color:#C9972D;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Order Number</div>
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;color:#FBF7F0;font-weight:700;">${escapeHtml(o.order_number)}</div>
                </td>
                <td align="right" style="padding:16px 20px;">
                  <div style="font-family:Poppins,Arial,sans-serif;font-size:10px;color:#C9972D;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Placed On</div>
                  <div style="font-family:Poppins,Arial,sans-serif;font-size:13px;color:#FBF7F0;font-weight:500;">${escapeHtml(formatDateIST(o.created_at))}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <div style="font-family:Poppins,Arial,sans-serif;font-size:11px;color:#C9972D;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
              In your box
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${itemRows}
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:16px 32px 0 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-family:Poppins,Arial,sans-serif;font-size:14px;color:#1B3A2D;">
              <tr>
                <td style="padding:6px 0;color:#5A4E3C;">Subtotal</td>
                <td align="right" style="padding:6px 0;">${inr(o.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#5A4E3C;">Shipping</td>
                <td align="right" style="padding:6px 0;">${o.shipping_cost > 0 ? inr(o.shipping_cost) : `<span style="color:#4F7A46;font-weight:600;">Free</span>`}</td>
              </tr>
              ${o.discount > 0 ? `
              <tr>
                <td style="padding:6px 0;color:#5A4E3C;">Discount</td>
                <td align="right" style="padding:6px 0;color:#C4512A;">&minus;${inr(o.discount)}</td>
              </tr>` : ""}
              <tr>
                <td style="padding:14px 0 0 0;border-top:2px solid #1B3A2D;font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:700;">Total</td>
                <td align="right" style="padding:14px 0 0 0;border-top:2px solid #1B3A2D;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;color:#C9972D;">${inr(o.total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping address -->
        <tr>
          <td style="padding:24px 32px 0 32px;">
            <div style="background:#FBF7F0;border:1px solid #E8DFCF;border-radius:10px;padding:16px 20px;">
              <div style="font-family:Poppins,Arial,sans-serif;font-size:11px;color:#C9972D;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                Shipping to
              </div>
              <div style="font-family:Poppins,Arial,sans-serif;font-size:14px;color:#1B3A2D;line-height:1.6;">
                <strong>${escapeHtml(o.customer_name)}</strong><br/>
                ${addressLines.join("<br/>")}
              </div>
            </div>
          </td>
        </tr>

        ${trackingBlock}

        <!-- CTA -->
        <tr>
          <td style="padding:32px 32px 8px 32px;text-align:center;">
            <a href="${SITE}/shop" style="display:inline-block;background:#1B3A2D;color:#FBF7F0;font-family:Poppins,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:999px;">
              Shop again
            </a>
          </td>
        </tr>

        <!-- Support -->
        <tr>
          <td style="padding:20px 32px 8px 32px;text-align:center;">
            <div style="font-family:Poppins,Arial,sans-serif;font-size:13px;color:#5A4E3C;line-height:1.7;">
              Need anything? Reply to this email, or reach us on<br/>
              <a href="mailto:support@worldofmysorepak.com" style="color:#1B3A2D;text-decoration:underline;">support@worldofmysorepak.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://wa.me/916364895293" style="color:#1B3A2D;text-decoration:underline;">WhatsApp +91 63648 95293</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1B3A2D;padding:24px 32px;text-align:center;">
            <div style="font-family:Poppins,Arial,sans-serif;font-size:11px;color:#FBF7F0;opacity:0.6;line-height:1.7;">
              World of Mysore Pak &middot; 138/B 52-D, JC Layout, Chamundi Betta Road<br/>
              Nazarbad Mohalla, Mysuru 570011, Karnataka, India<br/>
              <a href="${SITE}" style="color:#C9972D;text-decoration:none;">worldofmysorepak.com</a>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `Order confirmed: ${o.order_number}`,
    "",
    `Thank you, ${(o.customer_name ?? "").split(" ")[0] || "friend"}.`,
    "Your order is in our kitchen and we're getting it ready with care.",
    "",
    `Order number: ${o.order_number}`,
    `Placed on:   ${formatDateIST(o.created_at)}`,
    "",
    "In your box:",
    ...o.items.map((it) => `  ${it.product_name} — ${it.weight_label} × ${it.quantity}  = ${inr(it.unit_price * it.quantity)}`),
    "",
    `Subtotal: ${inr(o.subtotal)}`,
    `Shipping: ${o.shipping_cost > 0 ? inr(o.shipping_cost) : "Free"}`,
    ...(o.discount > 0 ? [`Discount: -${inr(o.discount)}`] : []),
    `Total:    ${inr(o.total)}`,
    "",
    "Shipping to:",
    `  ${o.customer_name}`,
    ...addressLines.map((l) => `  ${l.replace(/&amp;/g, "&").replace(/&#39;/g, "'")}`),
    "",
    ...(o.awb_code && o.courier_name ? [`Tracking: ${o.courier_name} — AWB ${o.awb_code}`, ""] : []),
    "Need help? Reply to this email or reach us on WhatsApp +91 63648 95293.",
    "",
    "World of Mysore Pak",
    "worldofmysorepak.com",
  ].join("\n");

  return { subject, html, text };
}
