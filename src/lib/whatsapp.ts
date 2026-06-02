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
import { createAdminClient } from "@/lib/supabase";

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
// Message log + session state (best-effort; failures don't block messaging)
// ──────────────────────────────────────────────

export async function logWhatsAppMessage(opts: {
  wa_id: string;
  direction: "inbound" | "outbound";
  msg_type?: string;
  body?: string | null;
  meta_msg_id?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("wa_messages").insert({
      wa_id: normalizeWhatsAppNumber(opts.wa_id),
      direction: opts.direction,
      msg_type: opts.msg_type ?? "text",
      body: opts.body ?? null,
      meta_msg_id: opts.meta_msg_id ?? null,
      raw: opts.raw ?? null,
    });
  } catch (err) {
    console.error("[whatsapp] logMessage failed:", err);
  }
}

export interface WaSession {
  wa_id: string;
  intent: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any> | null;
}

export async function getWaSession(wa_id: string): Promise<WaSession | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("wa_sessions")
      .select("wa_id, intent, context")
      .eq("wa_id", normalizeWhatsAppNumber(wa_id))
      .maybeSingle();
    return (data as WaSession) ?? null;
  } catch (err) {
    console.error("[whatsapp] getWaSession failed:", err);
    return null;
  }
}

export async function setWaSession(
  wa_id: string,
  intent: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any> | null = null
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("wa_sessions").upsert({
      wa_id: normalizeWhatsAppNumber(wa_id),
      intent,
      context,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[whatsapp] setWaSession failed:", err);
  }
}

export async function clearWaSession(wa_id: string): Promise<void> {
  return setWaSession(wa_id, null, null);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function metaMsgIdFromResponse(body: any): string | null {
  return body?.messages?.[0]?.id ?? null;
}

// Plain text reply inside the 24-hour service window.
export async function sendWhatsAppText(toRaw: string, text: string) {
  const to = normalizeWhatsAppNumber(toRaw);
  const body = text.slice(0, 4096);
  const res = await postToGraph({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: true, body },
  });
  await logWhatsAppMessage({
    wa_id: to, direction: "outbound", msg_type: "text", body,
    meta_msg_id: metaMsgIdFromResponse(res.body),
    raw: res.body,
  });
  return res;
}

// Interactive message with up to 3 reply buttons.
export async function sendWhatsAppButtons(
  toRaw: string,
  body: string,
  buttons: { id: string; title: string }[]
) {
  const to = normalizeWhatsAppNumber(toRaw);
  const text = body.slice(0, 1024);
  const res = await postToGraph({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) },
        })),
      },
    },
  });
  await logWhatsAppMessage({
    wa_id: to, direction: "outbound", msg_type: "interactive",
    body: text + " [" + buttons.map((b) => b.title).join(" | ") + "]",
    meta_msg_id: metaMsgIdFromResponse(res.body),
    raw: res.body,
  });
  return res;
}

// Template message — required for first contact OR outside the 24h window.
// Templates must be pre-approved in WhatsApp Manager.
export async function sendWhatsAppTemplate(
  toRaw: string,
  template: { name: string; language?: string; components?: unknown[] }
) {
  const to = normalizeWhatsAppNumber(toRaw);
  const res = await postToGraph({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template.name,
      language: { code: template.language ?? "en" },
      components: template.components ?? [],
    },
  });
  await logWhatsAppMessage({
    wa_id: to, direction: "outbound", msg_type: "template",
    body: `template:${template.name}`,
    meta_msg_id: metaMsgIdFromResponse(res.body),
    raw: { template, response: res.body },
  });
  return res;
}
