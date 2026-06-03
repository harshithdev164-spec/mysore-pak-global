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
import {
  sendWhatsAppText,
  sendWhatsAppButtons,
  normalizeWhatsAppNumber,
  getWaSession,
  setWaSession,
  clearWaSession,
} from "@/lib/whatsapp";
import {
  matchProducts,
  extractWeight,
  looksLikeOrderIntent,
} from "@/lib/whatsapp-products";
import { matchFaqSmart } from "@/lib/whatsapp-faq-matcher";

const SITE = "https://www.worldofmysorepak.com";

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

// FAQ matching is now handled by matchFaqSmart (synonyms + stemming + phrases
// + category boost). See src/lib/whatsapp-faq-matcher.ts.

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
    `Namaste! 🙏 You've reached *World of Mysore Pak*. How can I help?\n\n_(Type *human* anytime to talk to our team.)_`,
    [
      { id: "shop", title: "Show products" },
      { id: "track_order", title: "Track an order" },
      { id: "faq", title: "Common questions" },
    ]
  );
}

// Reply with up to 3 matched products + their direct links.
async function replyProductMatches(
  from: string,
  userText: string
): Promise<boolean> {
  const matches = await matchProducts(userText, 3);
  if (matches.length === 0) return false;

  const weight = extractWeight(userText);
  const lines: string[] = [];
  if (matches.length === 1) {
    const p = matches[0].product;
    const weightLine = weight
      ? `Weight requested: *${weight}* — pick it on the product page.`
      : "Pick your weight and check out:";
    lines.push(`Found it! ✨`);
    lines.push("");
    lines.push(`*${p.name}*`);
    if (p.weights?.length) {
      lines.push(
        p.weights
          .map((w) => `• ${w.label} — ₹${Math.round(Number(w.price))}`)
          .join("\n")
      );
    }
    lines.push("");
    lines.push(weightLine);
    lines.push(`${SITE}/products/${p.slug}`);
  } else {
    lines.push(`Here's what I found that matches *"${userText.slice(0, 60)}"*:`);
    lines.push("");
    for (const m of matches) {
      const cheapest = m.product.weights?.[0]
        ? Math.min(...m.product.weights.map((w) => Number(w.price)))
        : null;
      lines.push(
        `🍬 *${m.product.name}*${cheapest ? `  (from ₹${Math.round(cheapest)})` : ""}`
      );
      lines.push(`${SITE}/products/${m.product.slug}`);
      lines.push("");
    }
    lines.push(`Not what you wanted? Browse everything: ${SITE}/shop`);
  }
  await sendWhatsAppText(from, lines.join("\n"));
  return true;
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
    if (buttonId === "shop") {
      await setWaSession(from, "await_product_name");
      await sendWhatsAppText(
        from,
        `Browse our full range: ${SITE}/shop\n\nOr tell me what you're craving — e.g. *Kaju Mysore Pak*, *Chocolate Bites*, *Anjeer Mysore Pak* — and I'll send a direct link. 🍬`
      );
      return;
    }
    if (buttonId === "faq") {
      await clearWaSession(from);
      await sendWhatsAppText(
        from,
        `Sure — ask me anything! Most-asked topics:\n\n` +
          `🚚 *Shipping & tracking*\n• How long does delivery take?\n• Do you ship to my city?\n• Sunday / express delivery\n\n` +
          `💳 *Payment*\n• What payment methods do you accept?\n• EMI / QR / NEFT options\n• GST invoice\n\n` +
          `🍬 *Products*\n• Vegetarian / nut-free / jaggery options\n• Shelf life & freshness\n• Bestsellers\n\n` +
          `🎁 *Gifting*\n• Diwali / festival hampers\n• Wedding / corporate bulk orders\n\n` +
          `↩️ *Returns*\n• Damaged or missing item\n• Cancel my order\n\n` +
          `Just type your question naturally (English / Hindi / Kannada all work). Or type *human* to chat with our team.`
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
  if (session?.intent === "await_product_name") {
    const matched = await replyProductMatches(from, t);
    if (matched) {
      await clearWaSession(from);
      return;
    }
    await sendWhatsAppText(
      from,
      `Hmm, I couldn't find that. Try a different name — e.g. *Mysore Pak*, *Chocolate Bites*, *Kaju Barfi*, *Chakkuli*. Or browse: ${SITE}/shop`
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

  // Explicit "human" / "agent" / "support" keyword → handoff
  if (/^(human|agent|support|representative|talk to (someone|human|agent|team)|customer (care|service))\b/i.test(t)) {
    await clearWaSession(from);
    await handoffToHuman(from, "(keyword: human)");
    return;
  }

  // "shop" / "menu" / "products" / "catalog" → shop link
  if (/^(shop|menu|products?|catalog|catalogue|what do you sell|what do you have)\b/i.test(t)) {
    await sendWhatsAppText(
      from,
      `Browse our full range: ${SITE}/shop\n\nOr tell me what you're craving and I'll send a direct link.`
    );
    return;
  }

  // 2) Order intent → product matcher (e.g. "I want kaju mysore pak", "send me 500g chocolate bites")
  // CRITICAL: only short-circuit if we actually found a product. Otherwise
  // fall through to FAQ — queries like "I want to order how many days to
  // deliver to pune" contain "order" + "want" but are FAQ questions, not
  // product searches. Dead-ending them as "couldn't pin that down" lost
  // real customers in the logs.
  if (looksLikeOrderIntent(t)) {
    const matched = await replyProductMatches(from, t);
    if (matched) return;
    // No product match — fall through to FAQ matcher silently.
  }

  // 3) FAQ smart match (synonyms + stemming + phrase boost + category boost)
  const faqMatch = matchFaqSmart(t);
  if (faqMatch) {
    await replyFaq(from, faqMatch.entry);
    return;
  }

  // 4) Last resort — try product match without intent verb (e.g. user just says "kaju mysore pak")
  const products = await matchProducts(t, 3);
  if (products.length > 0 && products[0].score >= 3) {
    await replyProductMatches(from, t);
    return;
  }

  // 5) Human handoff
  await handoffToHuman(from, t);
}
