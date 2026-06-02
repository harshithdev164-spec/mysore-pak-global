/**
 * WhatsApp Cloud API client (Meta-hosted, graph.facebook.com).
 *
 * Env vars:
 *   WHATSAPP_PHONE_NUMBER_ID   — from WABA dashboard, e.g. "123456789012345"
 *   WHATSAPP_ACCESS_TOKEN      — permanent system-user token (Bearer)
 *   WHATSAPP_VERIFY_TOKEN      — string you set in webhook config; we echo it back
 *   WHATSAPP_APP_SECRET        — used to verify X-Hub-Signature-256 on incoming
 *   WHATSAPP_ADMIN_NUMBER      — owner's WhatsApp # for human handoff pings (10-digit IN)
 *   WHATSAPP_API_VERSION       — optional, defaults to "v21.0"
 */

import crypto from "crypto";

function apiVersion() {
  return process.env.WHATSAPP_API_VERSION ?? "v21.0";
}
function phoneNumberId() {
  return process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
}
function accessToken() {
  return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(phoneNumberId()) && Boolean(accessToken());
}

// Normalize an Indian mobile to E.164 without the leading "+".
// "+91 6364895014" / "91-6364-895-014" / "06364895014" → "916364895014"
export function normalizeWhatsAppNumber(raw: string): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 10) return "91" + d;
  if (d.length === 11 && d.startsWith("0")) return "91" + d.slice(1);
  if (d.length === 12 && d.startsWith("91")) return d;
  if (d.length === 13 && d.startsWith("091")) return d.slice(1);
  return d;
}

// Verify the X-Hub-Signature-256 header Meta sends on webhook POSTs.
// Pass the RAW request body string (not the parsed JSON).
export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header) return false;
  const provided = header.startsWith("sha256=") ? header.slice(7) : header;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────
// Send helpers
// ──────────────────────────────────────────────

async function postToGraph(body: unknown): Promise<{ ok: boolean; status: number; body: unknown }> {
  if (!isWhatsAppConfigured()) {
    throw new Error("WhatsApp not configured (WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN)");
  }
  const url = `https://graph.facebook.com/${apiVersion()}/${phoneNumberId()}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = text;
  try { parsed = JSON.parse(text); } catch { /* leave as text */ }
  if (!res.ok) {
    console.error("[whatsapp] send failed", res.status, text.slice(0, 400));
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

// Plain text reply inside the 24-hour service window.
export function sendWhatsAppText(toRaw: string, text: string) {
  return postToGraph({
    messaging_product: "whatsapp",
    to: normalizeWhatsAppNumber(toRaw),
    type: "text",
    text: { preview_url: true, body: text.slice(0, 4096) },
  });
}

// Interactive message with up to 3 reply buttons.
export function sendWhatsAppButtons(
  toRaw: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  return postToGraph({
    messaging_product: "whatsapp",
    to: normalizeWhatsAppNumber(toRaw),
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1024) },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) },
        })),
      },
    },
  });
}

// Template message — required for first contact OR outside the 24h window.
// Templates must be pre-approved in WhatsApp Manager.
export function sendWhatsAppTemplate(
  toRaw: string,
  template: { name: string; language?: string; components?: unknown[] }
) {
  return postToGraph({
    messaging_product: "whatsapp",
    to: normalizeWhatsAppNumber(toRaw),
    type: "template",
    template: {
      name: template.name,
      language: { code: template.language ?? "en" },
      components: template.components ?? [],
    },
  });
}
