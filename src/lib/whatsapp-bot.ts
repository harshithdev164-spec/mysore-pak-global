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
import { FAQ_ENTRIES } from "@/lib/chatbot-flows";
import { tryConversationalReply } from "@/lib/whatsapp-conversation";

const SITE = "https://www.worldofmysorepak.com";

const STATUS_LABEL: Record<string, string> = {
  pending: "⏳ Pending, awaiting payment confirmation",
  confirmed: "✅ Confirmed, we're preparing your sweets",
  pickup: "📦 Pickup scheduled, courier on the way",
  processing: "🔄 Processing at the courier hub",
  shipped: "🚚 Shipped, on its way to you",
  delivered: "🎉 Delivered, enjoy your Mysore Pak!",
  cancelled: "❌ Cancelled, please reach out if this is wrong",
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

function extractIndianPhone(text: string): string | null {
  const digits = String(text ?? "").replace(/\D/g, "");
  let normalized = digits;
  if (normalized.length === 13 && normalized.startsWith("091")) {
    normalized = normalized.slice(1);
  }
  if (normalized.length === 12 && normalized.startsWith("91")) {
    normalized = normalized.slice(2);
  }
  if (normalized.length === 11 && normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }
  return normalized.length === 10 ? normalized : null;
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
    `📋 *Order #${order.order_number}*`,
    "",
    status,
    `💳 Payment: ${order.payment_status}`,
  ];
  if (order.courier_name && order.awb_code) {
    lines.push("");
    lines.push(`🚚 Courier: *${order.courier_name}*`);
    lines.push(`🔢 AWB: *${order.awb_code}*`);
    const builder = COURIER_TRACK_URL[(order.courier_name as string).toLowerCase()];
    if (builder) {
      lines.push("");
      lines.push(`👉 Live tracking: ${builder(order.awb_code as string)}`);
    }
  } else if (order.status === "confirmed") {
    lines.push("");
    lines.push(`📦 Your sweets are being prepared, the courier AWB usually generates within 24-48 hours of payment. I'll WhatsApp you the tracking link the moment it ships.`);
  }
  await sendWhatsAppText(from, lines.join("\n"));
}

async function replyOrdersByPhone(from: string, phone: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "order_number, status, payment_status, courier_name, awb_code, customer_name, total, created_at"
    )
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!orders || orders.length === 0) {
    await sendWhatsAppText(
      from,
      `I couldn't find any orders linked to *${phone}*. Try your order number instead, or reply with anything to talk to a human.`
    );
    return;
  }

  if (orders.length === 1) {
    const order = orders[0];
    const status = STATUS_LABEL[order.status as string] ?? `Status: ${order.status}`;
    const lines = [
      `📋 *Order #${order.order_number}*`,
      "",
      status,
      `💳 Payment: ${order.payment_status}`,
      `💰 Total: ₹${Math.round(Number(order.total))}`,
    ];
    if (order.courier_name && order.awb_code) {
      lines.push("");
      lines.push(`🚚 Courier: *${order.courier_name}*`);
      lines.push(`🔢 AWB: *${order.awb_code}*`);
      const builder = COURIER_TRACK_URL[(order.courier_name as string).toLowerCase()];
      if (builder) {
        lines.push("");
        lines.push(`👉 Live tracking: ${builder(order.awb_code as string)}`);
      }
    }
    await sendWhatsAppText(from, lines.join("\n"));
    return;
  }

  const lines = [
    `I found ${orders.length} recent orders for *${phone}*:`,
    "",
  ];
  for (const order of orders) {
    const status = STATUS_LABEL[order.status as string] ?? `Status: ${order.status}`;
    lines.push(`*#${order.order_number}*, ${status}`);
    lines.push(`Payment: ${order.payment_status} • ₹${Math.round(Number(order.total))}`);
    if (order.courier_name && order.awb_code) {
      const builder = COURIER_TRACK_URL[(order.courier_name as string).toLowerCase()];
      if (builder) lines.push(`Track: ${builder(order.awb_code as string)}`);
    }
    lines.push("");
  }
  lines.push(`Reply with the order number to see detailed tracking for one order.`);
  await sendWhatsAppText(from, lines.join("\n"));
}

async function replyFaq(from: string, faq: { question: string; answer: string }): Promise<void> {
  await sendWhatsAppText(from, `*${faq.question}*\n\n${faq.answer}`);
}

async function handoffToHuman(
  from: string,
  originalText: string,
  opts: { withMenu?: boolean } = {}
): Promise<void> {
  if (opts.withMenu) {
    // Combine the "we'll get back to you" text + the menu buttons in
    // one interactive message so the customer always has a clear next
    // step instead of staring at a dead-end.
    await sendWhatsAppButtons(
      from,
      `Hmm, I'm not sure I got that one, let me flag it to our team. Meanwhile, here's what I CAN help with right now:\n\n_(Or email hello@worldofmysorepak.com to reach us directly.)_`,
      [
        { id: "shop", title: "🍬 Browse Products" },
        { id: "track_order", title: "📦 Track Order" },
        { id: "faq", title: "❓ FAQs" },
      ]
    );

  } else {
    // Explicit "human" request — just acknowledge, don't shove buttons
    // in their face when they asked for a person.
    await sendWhatsAppText(
      from,
      `Thanks for reaching out! I'll connect you with our team, someone will get back to you soon. In the meantime, you can email hello@worldofmysorepak.com.`
    );
  }

  // Ping the admin's number if configured (both flows)
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
    `Namaste! 🙏 You've reached *World of Mysore Pak*. How can I help?\n\nType *offers* for promotions or *contact* for store details.`,
    [
      { id: "shop", title: "🍬 Browse Products" },
      { id: "track_order", title: "📦 Track Order" },
      { id: "faq", title: "❓ FAQs" },
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
      ? `Weight requested: *${weight}*, pick it on the product page.`
      : "Pick your weight and check out:";
    lines.push(`Found it! ✨`);
    lines.push("");
    lines.push(`*${p.name}*`);
    if (p.weights?.length) {
      lines.push(
        p.weights
          .map((w) => `• ${w.label}, ₹${Math.round(Number(w.price))}`)
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
// Tier-1 Feature: FAQ Categories Menu
// ──────────────────────────────────────────────
async function replyFaqCategories(from: string): Promise<void> {
  await sendWhatsAppButtons(
    from,
    `📚 *Help Topics*\n\nChoose a category or just type your question, I'm listening! 🎧`,
    [
      { id: "faq_shipping", title: "🚚 Shipping" },
      { id: "faq_payment", title: "💳 Payment" },
      { id: "faq_products", title: "🍬 Products" },
      { id: "faq_returns", title: "↩️ Returns" },
    ]
  );
}

// Show top FAQ answers for a category
async function replyFaqByCategory(from: string, category: string): Promise<void> {
  const entries = FAQ_ENTRIES.filter((e) => e.category === category);
  
  if (entries.length === 0) {
    await sendWhatsAppText(from, `No FAQs found for that category. Try asking me directly or type *human* to chat with our team.`);
    return;
  }

  // Show top 3 FAQs for this category
  const lines: string[] = [];
  for (const faq of entries.slice(0, 3)) {
    lines.push(`*${faq.question}*`);
    lines.push(faq.answer);
    lines.push("");
  }

  lines.push(`Still have questions? Type your question naturally or ask for a *human*. 💬`);
  await sendWhatsAppText(from, lines.join("\n"));
}

// ──────────────────────────────────────────────
// Tier-1 Feature: Current Promotions
// ──────────────────────────────────────────────
async function replyPromotions(from: string): Promise<void> {
  const text = `
🎉 *Current Offers & Promotions*

💝 *Summer Festival Special* (valid till June 30)
  • Buy 3 items → 15% off
  • Free shipping on orders above ₹1,500
  • Use code: *SUMMER15*

🎁 *New Customer Exclusive*
  • 10% off your first order
  • Use code: *WELCOME10*

🏷️ *Bulk Orders (5kg+)*
  • 20% off on orders 5–10kg
  • 25% off on orders 10kg+
  • Email: hello@worldofmysorepak.com

🌟 *Referral Program*
  • Share your code → They get 10% off
  • You get ₹100 credit per referral

Full shop: ${SITE}/shop
  `.trim();
  await sendWhatsAppText(from, text);
}

// ──────────────────────────────────────────────
// Tier-1 Feature: Business Info
// ──────────────────────────────────────────────
async function replyBusinessInfo(from: string): Promise<void> {
  const text = `
📍 *World of Mysore Pak*

🏪 *Location*
138/B 52-D, 49-D block JC Layout
Chamundi Betta Road, Mysuru 570011

⏰ *Store Hours*
Monday–Sunday: 10:00 AM – 7:00 PM
(Closed on national holidays)

📞 *Contact Us*
Email: hello@worldofmysorepak.com

🌐 Website: worldofmysorepak.com

Or ask me anything in this chat! 💬
  `.trim();
  await sendWhatsAppText(from, text);
}

// ──────────────────────────────────────────────
// Tier-1 Feature: Bestsellers
// ──────────────────────────────────────────────
async function replyBestsellers(from: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: bestsellers } = await supabase
      .from("products")
      .select("id, name, slug, weights(price)")
      .eq("active", true)
      .order("sales_count", { ascending: false })
      .limit(5);

    if (!bestsellers || bestsellers.length === 0) {
      await sendWhatsAppText(from, `Check out our full collection: ${SITE}/shop 🍬`);
      return;
    }

    const lines: string[] = ["🌟 *Our Bestsellers*", ""];
    for (const p of bestsellers) {
      const weights = (p.weights as unknown as Array<{ price: number }>) || [];
      const price = weights.length > 0 ? Math.round(weights[0].price) : null;
      const priceStr = price ? `, from ₹${price}` : "";
      lines.push(`🍬 *${p.name}*${priceStr}`);
      lines.push(`${SITE}/products/${p.slug}`);
      lines.push("");
    }
    lines.push(`Browse all: ${SITE}/shop`);
    await sendWhatsAppText(from, lines.join("\n"));
  } catch (err) {
    console.error("[whatsapp] replyBestsellers failed:", err);
    await sendWhatsAppText(from, `Check out our full collection: ${SITE}/shop 🍬`);
  }
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
        `Sure! Please enter your *order number* (e.g. *0363* or *WMP-0363*) or your *registered mobile number* and I'll pull up your live tracking — courier, AWB, status, and a direct DTDC tracking link.`
      );
      return;
    }
    if (buttonId === "shop") {
      await setWaSession(from, "await_product_name");
      await sendWhatsAppText(
        from,
        `Browse our full range: ${SITE}/shop\n\nOr tell me what you're craving, e.g. *Kaju Mysore Pak*, *Chocolate Bites*, *Anjeer Mysore Pak*, and I'll send a direct link. 🍬`
      );
      return;
    }
    if (buttonId === "faq") {
      await clearWaSession(from);
      await replyFaqCategories(from);
      return;
    }
    if (buttonId === "promo") {
      await clearWaSession(from);
      await replyPromotions(from);
      return;
    }
    if (buttonId === "contact") {
      await clearWaSession(from);
      await replyBusinessInfo(from);
      return;
    }
    
    // FAQ category handlers
    if (buttonId?.startsWith("faq_")) {
      const category = buttonId.slice(4); // "faq_shipping" → "shipping"
      await clearWaSession(from);
      await replyFaqByCategory(from, category);
      return;
    }
    
    // Talk to human
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

  // Greetings should always reset the bot to the main menu.
  if (/^(hi+|hello+|hey+|namaste|namaskar|good (morning|afternoon|evening))\b/i.test(t)) {
    await clearWaSession(from);
    await replyGreeting(from);
    return;
  }

  // Escape hatch from any session
  if (/^(menu|back|cancel|restart)$/i.test(t)) {
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
    const phone = extractIndianPhone(t);
    if (phone) {
      await clearWaSession(from);
      await replyOrdersByPhone(from, phone);
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
      `Hmm, I couldn't find that. Try a different name, e.g. *Mysore Pak*, *Chocolate Bites*, *Kaju Barfi*, *Chakkuli*. Or browse: ${SITE}/shop`
    );
    return;
  }

  // Escape hatch from any session
  if (/^(menu|back|cancel|restart)$/i.test(t)) {
    await clearWaSession(from);
    await replyGreeting(from);
    return;
  }

  // ── Conversational micro-intents (thanks, ok, hmm, bye, compliments,
  // frustration, single-character pings, vague queries) — handled with
  // warm varied replies before the FAQ/product matcher gets a turn.
  if (await tryConversationalReply(from, t)) return;

  // 1) Order-number → status (stateless shortcut)
  const orderNum = extractOrderNumber(t);
  if (orderNum) {
    await replyOrderStatus(from, orderNum);
    return;
  }

  const phone = extractIndianPhone(t);
  if (phone) {
    await replyOrdersByPhone(from, phone);
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

  if (/^(offers|promo|promotions|deals|discounts?)\b/i.test(t)) {
    await replyPromotions(from);
    return;
  }

  if (/^(contact|help|reach us|phone|whatsapp|email|address|where are you)\b/i.test(t)) {
    await replyBusinessInfo(from);
    return;
  }

  if (/\b(best sellers?|top sellers|popular products|trending items)\b/i.test(t)) {
    await replyBestsellers(from);
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

  // 5) Last resort — bot couldn't match anything useful. Send the
  // handoff message PLUS the 3-button menu so the customer isn't
  // dead-ended with no clear action.
  await handoffToHuman(from, t, { withMenu: true });
}
