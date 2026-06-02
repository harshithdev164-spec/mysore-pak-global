/**
 * WhatsApp bot intent router — stateless per-message.
 *
 * Decides what to reply based on the incoming message body:
 *   1. Order-number pattern (e.g. "0123", "#0123", "WMP-1234") → status lookup
 *   2. FAQ keyword match → canned answer
 *   3. Anything else → human handoff (notify admin)
 *
 * No conversation state for v1. If we add multi-turn flows later, we can
 * persist last-intent per phone number in a small `wa_sessions` table.
 */

import { createAdminClient } from "@/lib/supabase";
import { FAQ_ENTRIES } from "@/lib/chatbot-flows";
import {
  sendWhatsAppText,
  sendWhatsAppButtons,
  normalizeWhatsAppNumber,
  getWaSession,
  setWaSession,
  clearWaSession,
} from "@/lib/whatsapp";

const STATUS_LABEL: Record<string, string> = {
  pending: "⏳ Pending — awaiting payment confirmation",
  confirmed: "✅ Confirmed — we're preparing your sweets",
  pickup: "📦 Pickup scheduled — courier on the way",
  processing: "🔄 Processing at the courier hub",
  shipped: "🚚 Shipped — on its way to you",
  delivered: "🎉 Delivered — enjoy your Mysore Pak!",
  cancelled: "❌ Cancelled — please reach out if this is wrong",
};

const COURIER_TRACK_URL: Record<string, (awb: string) => string> = {
  delhivery: (a) => `https://www.delhivery.com/tracking?id=${a}`,
  "dtdc express": (a) => `https://trackcourier.io/track-and-trace/dtdc/${a}`,
  dtdc: (a) => `https://trackcourier.io/track-and-trace/dtdc/${a}`,
  "dhl express": (a) =>
    `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${a}`,
  dhl: (a) =>
    `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${a}`,
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

// Order numbers in this codebase are 4-digit padded numerics (e.g. "0363").
// We also accept legacy "WMP-XXXX" prefixed forms and a leading "#".
function extractOrderNumber(text: string): string | null {
  const t = text.trim().toUpperCase();
  // WMP-1234
  let m = t.match(/\bWMP-?(\d{3,6})\b/);
  if (m) return m[1].padStart(4, "0");
  // #0363 or just 0363 (3-6 digit numeric, no other digits next to it)
  m = t.match(/(?:^|[^\d])#?(\d{3,6})(?:[^\d]|$)/);
  if (m) return m[1].padStart(4, "0");
  return null;
}

// Crude keyword-based FAQ match — picks the entry with the most overlapping
// non-trivial words. Returns null if best score is below threshold.
function matchFaq(text: string): { question: string; answer: string } | null {
  const STOPWORDS = new Set([
    "the","a","an","is","are","do","does","i","you","my","your",
    "to","for","of","and","or","in","on","at","with","can","could",
    "would","should","what","how","when","where","why","please","pls",
    "hi","hello","hey","there","ok","okay","thanks","thank",
  ]);
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (tokens.length === 0) return null;

  let best: { entry: { question: string; answer: string }; score: number } | null = null;
  for (const entry of FAQ_ENTRIES) {
    const haystack = (entry.question + " " + entry.answer).toLowerCase();
    let score = 0;
    for (const t of tokens) if (haystack.includes(t)) score++;
    if (!best || score > best.score) best = { entry, score };
  }
  if (!best || best.score < 2) return null;
  return best.entry;
}

// ──────────────────────────────────────────────
// Reply handlers
// ──────────────────────────────────────────────

async function replyOrderStatus(from: string, orderNumber: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "order_number, status, payment_status, courier_name, awb_code, customer_name, total"
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) {
    await sendWhatsAppText(
      from,
      `I couldn't find an order with number *${orderNumber}*. Double-check the number from your confirmation email, or reply with anything to talk to a human.`
    );
    return;
  }

  const status = STATUS_LABEL[order.status as string] ?? `Status: ${order.status}`;
  const lines = [
    `*Order #${order.order_number}*`,
    status,
    `Payment: ${order.payment_status}`,
  ];
  if (order.courier_name && order.awb_code) {
    lines.push("", `Courier: ${order.courier_name}`, `AWB: ${order.awb_code}`);
    const builder = COURIER_TRACK_URL[(order.courier_name as string).toLowerCase()];
    if (builder) lines.push(`Track: ${builder(order.awb_code as string)}`);
  }
  await sendWhatsAppText(from, lines.join("\n"));
}

async function replyFaq(from: string, faq: { question: string; answer: string }): Promise<void> {
  await sendWhatsAppText(from, `*${faq.question}*\n\n${faq.answer}`);
}

async function handoffToHuman(from: string, originalText: string): Promise<void> {
  // Tell the customer
  await sendWhatsAppText(
    from,
    `Thanks for reaching out! I'll connect you with our team — someone will get back to you soon. In the meantime, you can reach us directly at +91 6364895014 or hello@worldofmysorepak.com.`
  );

  // Ping the admin's number if configured
  const adminRaw = process.env.WHATSAPP_ADMIN_NUMBER;
  if (adminRaw) {
    const admin = normalizeWhatsAppNumber(adminRaw);
    if (admin && admin !== normalizeWhatsAppNumber(from)) {
      try {
        await sendWhatsAppText(
          admin,
          `🆘 *Customer needs help*\n\nFrom: +${from}\nThey said: "${originalText.slice(0, 400)}"`
        );
      } catch (err) {
        console.error("[whatsapp] admin notify failed:", err);
      }
    }
  }
}

async function replyGreeting(from: string): Promise<void> {
  await sendWhatsAppButtons(
    from,
    `Namaste! 🙏 You've reached *World of Mysore Pak*. How can I help?`,
    [
      { id: "track_order", title: "Track an order" },
      { id: "faq", title: "Common questions" },
      { id: "human", title: "Talk to human" },
    ]
  );
}

// ──────────────────────────────────────────────
// Main router
// ──────────────────────────────────────────────

export interface IncomingMessage {
  from: string;        // WA number, e.g. "919876543210"
  text: string;        // best-effort body text (interactive replies use the title)
  buttonId?: string;   // id from button click, if any
}

export async function routeIncomingMessage(msg: IncomingMessage): Promise<void> {
  const { from, text, buttonId } = msg;
  const t = (text ?? "").trim();

  // Button replies — explicit intents (always reset session)
  if (buttonId) {
    if (buttonId === "track_order") {
      await setWaSession(from, "await_order_number");
      await sendWhatsAppText(
        from,
        "Sure — please reply with your order number (e.g. *0363* or *WMP-0363*)."
      );
      return;
    }
    if (buttonId === "faq") {
      await clearWaSession(from);
      await sendWhatsAppText(
        from,
        "Ask anything: delivery time, ingredients, shipping, returns, payment. I'll do my best!"
      );
      return;
    }
    if (buttonId === "human") {
      await clearWaSession(from);
      await handoffToHuman(from, "(button: talk to human)");
      return;
    }
  }

  // Empty / unknown payload
  if (!t) {
    await clearWaSession(from);
    await replyGreeting(from);
    return;
  }

  // ── Multi-turn: handle awaited prompts before keyword routing ──
  const session = await getWaSession(from);
  if (session?.intent === "await_order_number") {
    const num = extractOrderNumber(t);
    if (num) {
      await clearWaSession(from);
      await replyOrderStatus(from, num);
      return;
    }
    // Still didn't get a valid number — gentle re-prompt, keep session open
    await sendWhatsAppText(
      from,
      `That doesn't look like an order number. It's a 4-digit number from your confirmation email or SMS, e.g. *0363*. Or type *menu* to start over.`
    );
    return;
  }

  // Escape hatch from any session
  if (/^(menu|back|cancel|restart)$/i.test(t)) {
    await clearWaSession(from);
    await replyGreeting(from);
    return;
  }

  // 1) Order-number → status (stateless shortcut)
  const orderNum = extractOrderNumber(t);
  if (orderNum) {
    await replyOrderStatus(from, orderNum);
    return;
  }

  // Greetings → quick menu
  if (/^(hi+|hello+|hey+|namaste|namaskar|good (morning|afternoon|evening))\b/i.test(t)) {
    await replyGreeting(from);
    return;
  }

  // 2) FAQ keyword match
  const faq = matchFaq(t);
  if (faq) {
    await replyFaq(from, faq);
    return;
  }

  // 3) Human handoff
  await handoffToHuman(from, t);
}
