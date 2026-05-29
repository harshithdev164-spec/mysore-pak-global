"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Headphones, X, Send, Loader2, Copy, Check } from "lucide-react";
import {
  MAIN_MENU_ACTIONS,
  FAQ_CATEGORIES,
  BROWSE_CATEGORIES,
  BROWSE_OCCASIONS,
  getFaqsForCategory,
  CONTACT_INFO,
  SHIPPING_BLURB,
  STATUS_LABELS,
  classifyIntent,
  type QuickAction,
} from "@/lib/chatbot-flows";

type Sender = "bot" | "user";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  // Optional rich content rendered with the message
  options?: QuickAction[];
  orderCard?: OrderCardData;
  orderCards?: OrderCardData[];   // when looking up by phone, multiple may match
  productCards?: ProductCardData[];
  showContact?: boolean;
}

interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  badge: string | null;
  base_price: number | null;
  weights?: { label: string; price: number }[];
}

interface OrderCardData {
  order_number: string;
  status: string;
  customer_name: string;
  total: number;
  awb_code: string | null;
  courier_name: string | null;
  created_at: string;
  shipping_country?: string;
  items: { product_name: string; weight_label?: string; quantity: number }[];
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [waitingFor, setWaitingFor] = useState<"order_number" | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Greet on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      pushBot(
        "Hi! I'm the Mysore Pak assistant 👋\n\nHow can I help you today?",
        { options: MAIN_MENU_ACTIONS }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll to bottom on every new message
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  function pushBot(text: string, extras: Partial<ChatMessage> = {}) {
    setMessages((m) => [...m, { id: uid(), sender: "bot", text, ...extras }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { id: uid(), sender: "user", text }]);
  }

  const handleAction = useCallback(async (actionId: string) => {
    // Main menu actions
    if (actionId === "track") {
      pushUser("📦 Track my order");
      pushBot(
        "Sure — please enter your **order number** (e.g. WMP-A12345) or the **mobile number** you used to place the order."
      );
      setWaitingFor("order_number");
      return;
    }
    if (actionId === "browse") {
      pushUser("🍯 Browse products");
      pushBot(
        "Lovely! Pick a category or an occasion and I'll show you our picks.",
        {
          options: [
            ...BROWSE_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
            ...BROWSE_OCCASIONS.map((o) => ({ id: o.id, label: o.label })),
          ],
        }
      );
      return;
    }
    if (actionId === "faq") {
      pushUser("❓ Frequently asked");
      pushBot("Which topic would you like help with?", { options: FAQ_CATEGORIES });
      return;
    }
    if (actionId === "shipping") {
      pushUser("🚚 Shipping info");
      pushBot(SHIPPING_BLURB, { options: MAIN_MENU_ACTIONS });
      return;
    }
    if (actionId === "contact") {
      pushUser("📞 Contact us");
      pushBot("Here's how to reach us:", { showContact: true, options: MAIN_MENU_ACTIONS });
      return;
    }
    if (actionId === "main") {
      pushBot("What else can I help with?", { options: MAIN_MENU_ACTIONS });
      return;
    }

    // Browse category selected → look up products in that category
    const cat = BROWSE_CATEGORIES.find((c) => c.id === actionId);
    if (cat) {
      pushUser(cat.label);
      await lookupProducts({ category: cat.slug, label: cat.label });
      return;
    }
    // Browse occasion selected → free-text product search
    const occ = BROWSE_OCCASIONS.find((o) => o.id === actionId);
    if (occ) {
      pushUser(occ.label);
      await lookupProducts({ q: occ.q, label: occ.label });
      return;
    }

    // FAQ category selected → show questions list
    if (FAQ_CATEGORIES.some((c) => c.id === actionId)) {
      const cat = FAQ_CATEGORIES.find((c) => c.id === actionId)!;
      pushUser(cat.label);
      const faqs = getFaqsForCategory(actionId);
      pushBot(`Here are common questions about ${cat.label.toLowerCase()}:`, {
        options: faqs.map((f, i) => ({ id: `faq_${actionId}_${i}`, label: f.question })),
      });
      return;
    }

    // FAQ question selected → show answer
    if (actionId.startsWith("faq_")) {
      const [, catId, idxStr] = actionId.split("_");
      const idx = parseInt(idxStr, 10);
      const faqs = getFaqsForCategory(catId);
      const faq = faqs[idx];
      if (faq) {
        pushUser(faq.question);
        pushBot(faq.answer, {
          options: [
            { id: "faq", label: "🔁 Another question" },
            { id: "main", label: "🏠 Main menu" },
          ],
        });
      }
      return;
    }
  }, []);

  async function lookupOrder(query: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const rows = (json?.data ?? []) as Array<{
        order_number: string;
        status: string;
        customer_name: string;
        total: number;
        awb_code: string | null;
        courier_name: string | null;
        created_at: string;
        shipping_address?: { country?: string };
        items?: { product_name: string; weight_label?: string; quantity: number }[];
      }>;

      if (!Array.isArray(rows) || rows.length === 0) {
        pushBot(
          `Hmm, I couldn't find any order matching that. Double-check the order number (usually looks like "WMP-XXXXX") or the mobile number you used at checkout. You can also reach our support team if you've lost your order number.`,
          {
            options: [
              { id: "track", label: "🔁 Try again" },
              { id: "contact", label: "📞 Contact us" },
              { id: "main", label: "🏠 Main menu" },
            ],
          }
        );
        return;
      }

      const cards: OrderCardData[] = rows.map((o) => ({
        order_number: o.order_number,
        status: o.status,
        customer_name: o.customer_name,
        total: o.total,
        awb_code: o.awb_code,
        courier_name: o.courier_name,
        created_at: o.created_at,
        shipping_country: o.shipping_address?.country,
        items: (o.items ?? []).map((it) => ({
          product_name: it.product_name,
          weight_label: it.weight_label,
          quantity: it.quantity,
        })),
      }));

      const intro =
        cards.length === 1
          ? `Here's the latest on your order:`
          : `Found ${cards.length} recent orders for you:`;

      pushBot(intro, { orderCards: cards });

      // Tracking instructions message — sent as a separate bot message so it
      // formats nicely beneath the cards.
      pushBot(
        `💡 **For live tracking** — tap the *Track on Delhivery / DHL* button on any card. The courier site shows live location, scan history, and estimated delivery time.\n\n📲 You can also save the AWB number to receive SMS / WhatsApp updates from the courier.\n\nAnything else?`,
        {
          options: [
            { id: "track", label: "🔁 Track another order" },
            { id: "contact", label: "📞 Contact us" },
            { id: "main", label: "🏠 Main menu" },
          ],
        }
      );
    } catch {
      pushBot(`Something went wrong fetching your order. Please try again or contact support.`, {
        options: [
          { id: "track", label: "🔁 Try again" },
          { id: "contact", label: "📞 Contact us" },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  async function lookupProducts(opts: { category?: string; q?: string; label?: string }) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (opts.category) params.set("category", opts.category);
      if (opts.q) params.set("q", opts.q);
      const res = await fetch(`/api/chatbot/products?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const rows = (json?.data ?? []) as Array<{
        id: string;
        name: string;
        slug: string;
        image: string | null;
        badge: string | null;
        base_price: number | null;
        weights?: { label: string; price: number }[];
      }>;

      if (!Array.isArray(rows) || rows.length === 0) {
        pushBot(
          `I couldn't find products matching ${opts.label ?? "that"} right now. Want to browse all categories instead?`,
          { options: [{ id: "browse", label: "🍯 Browse products" }, { id: "main", label: "🏠 Main menu" }] }
        );
        return;
      }

      const cards: ProductCardData[] = rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        badge: p.badge,
        base_price: p.base_price,
        weights: p.weights,
      }));

      pushBot(
        `Here are some ${opts.label ?? "products"} you might love:`,
        { productCards: cards }
      );
      pushBot(`Anything else I can help with?`, {
        options: [
          { id: "browse", label: "🍯 Browse more" },
          { id: "track", label: "📦 Track my order" },
          { id: "main", label: "🏠 Main menu" },
        ],
      });
    } catch {
      pushBot(`Something went wrong fetching products. Please try again.`, {
        options: [{ id: "browse", label: "🔁 Try again" }, { id: "main", label: "🏠 Main menu" }],
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFreeText(text: string) {
    pushUser(text);

    if (waitingFor === "order_number") {
      setWaitingFor(null);
      await lookupOrder(text.trim());
      return;
    }

    const intent = classifyIntent(text);
    if (intent === "track") {
      pushBot(
        "Sure — please share your **order number** or the **mobile number** you used to place the order."
      );
      setWaitingFor("order_number");
    } else if (intent === "browse") {
      // Use the customer's text as the search query directly
      await lookupProducts({ q: text, label: `"${text}"` });
    } else if (intent === "faq") {
      pushBot("Which topic would you like help with?", { options: FAQ_CATEGORIES });
    } else if (intent === "shipping") {
      pushBot(SHIPPING_BLURB, { options: MAIN_MENU_ACTIONS });
    } else if (intent === "contact") {
      pushBot("Here's how to reach us:", { showContact: true, options: MAIN_MENU_ACTIONS });
    } else {
      pushBot(
        `I'm not quite sure how to help with that. Pick one of these and I'll do my best:`,
        { options: MAIN_MENU_ACTIONS }
      );
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    handleFreeText(text);
  }

  return (
    <>
      {/* Floating launcher — compact icon-only button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          title="Customer Support"
          className="fixed bottom-6 right-6 z-[55] w-12 h-12 rounded-full bg-[#1B3A2D] hover:bg-[#C9972D] text-[#FBF7F0] shadow-lg shadow-[#1B3A2D]/30 hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
        >
          <Headphones className="w-5 h-5" />
          {/* Online dot */}
          <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400 border-2 border-[#1B3A2D]" />
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[55] w-[min(380px,calc(100vw-2rem))] h-[min(600px,calc(100vh-2rem))] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#1B3A2D]/10"
        >
          {/* Header */}
          <div className="bg-[#1B3A2D] text-[#FBF7F0] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#C9972D] flex items-center justify-center font-heading text-base italic font-bold text-[#1B3A2D] shadow-inner">
                M
              </div>
              <div>
                <div className="font-heading text-sm font-bold">Customer Support</div>
                <div className="text-[10px] opacity-70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online · Typically replies instantly
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FBF7F0]"
          >
            {messages.map((m) => (
              <div key={m.id} className={m.sender === "user" ? "flex justify-end" : ""}>
                <div
                  className={`max-w-[85%] ${
                    m.sender === "bot"
                      ? "bg-white text-[#1B3A2D] rounded-2xl rounded-tl-sm"
                      : "bg-[#1B3A2D] text-[#FBF7F0] rounded-2xl rounded-tr-sm"
                  } px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line shadow-sm`}
                >
                  {m.text}
                </div>

                {m.orderCard && (
                  <div className="mt-2 max-w-[85%]">
                    <OrderResultCard data={m.orderCard} />
                  </div>
                )}

                {m.orderCards && m.orderCards.length > 0 && (
                  <div className="mt-2 max-w-[85%] space-y-2">
                    {m.orderCards.map((c) => (
                      <OrderResultCard key={c.order_number} data={c} />
                    ))}
                  </div>
                )}

                {m.productCards && m.productCards.length > 0 && (
                  <div className="mt-2 max-w-[85%] space-y-2">
                    {m.productCards.map((p) => (
                      <ProductResultCard key={p.id} data={p} />
                    ))}
                  </div>
                )}

                {m.showContact && (
                  <div className="mt-2 max-w-[85%]">
                    <ContactCard />
                  </div>
                )}

                {m.options && m.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                    {m.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleAction(opt.id)}
                        className="text-[12px] bg-white hover:bg-[#C9972D] hover:text-white text-[#1B3A2D] border border-[#1B3A2D]/15 px-3 py-1.5 rounded-full font-medium transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-[#1B3A2D]/60">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Looking that up…
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="border-t border-[#1B3A2D]/10 bg-white px-3 py-2 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                waitingFor === "order_number"
                  ? "Order number or mobile number…"
                  : "Type a message…"
              }
              className="flex-1 text-sm px-3 py-2 rounded-full bg-[#FBF7F0] border border-transparent focus:outline-none focus:border-[#C9972D]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="w-9 h-9 rounded-full bg-[#C9972D] hover:bg-[#1B3A2D] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────
// Order result card
// ──────────────────────────────────────────────
function OrderResultCard({ data }: { data: OrderCardData }) {
  const status = STATUS_LABELS[data.status] ?? {
    emoji: "📦",
    title: data.status,
    description: "",
  };
  const intl = data.shipping_country && data.shipping_country !== "IN";
  const courierName = data.courier_name ?? (intl ? "DHL Express" : "Delhivery");
  const trackingUrl = data.awb_code
    ? intl
      ? `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${data.awb_code}`
      : `https://www.delhivery.com/tracking?id=${data.awb_code}`
    : null;
  const courierSiteUrl = intl
    ? "https://www.dhl.com/global-en/home/tracking.html"
    : "https://www.delhivery.com/track-order";

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!data.awb_code) return;
    try {
      await navigator.clipboard.writeText(data.awb_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white border border-[#C9972D]/30 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[#C9972D]/10 to-transparent px-3.5 py-2.5 border-b border-[#1B3A2D]/5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#1B3A2D]/60">{data.order_number}</span>
          <span className="text-[10px] text-[#1B3A2D]/50">
            {new Date(data.created_at).toLocaleDateString("en-IN")}
          </span>
        </div>
        <div className="mt-1 font-heading font-bold text-[#1B3A2D] text-sm">{data.customer_name}</div>
      </div>
      <div className="px-3.5 py-2.5">
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none mt-0.5">{status.emoji}</span>
          <div className="flex-1">
            <div className="font-semibold text-[13px] text-[#1B3A2D]">{status.title}</div>
            <div className="text-[11px] text-[#1B3A2D]/60 leading-snug">{status.description}</div>
          </div>
        </div>

        <div className="mt-2.5 text-[11px] text-[#1B3A2D]/70 space-y-0.5">
          {data.items.slice(0, 3).map((it, i) => (
            <div key={i}>
              • {it.product_name}
              {it.weight_label ? ` (${it.weight_label})` : ""} × {it.quantity}
            </div>
          ))}
          {data.items.length > 3 && (
            <div className="opacity-60">…and {data.items.length - 3} more</div>
          )}
        </div>

        {/* AWB / Tracking number block — only when issued */}
        {data.awb_code && (
          <div className="mt-2.5 pt-2.5 border-t border-[#1B3A2D]/5">
            <div className="text-[10px] uppercase tracking-wider text-[#1B3A2D]/50 font-medium mb-1">
              {courierName} tracking number
            </div>
            <div className="flex items-center gap-2 bg-[#FBF7F0] rounded-lg px-2.5 py-1.5 border border-[#1B3A2D]/10">
              <span className="font-mono text-[12px] text-[#1B3A2D] font-semibold tracking-wider break-all flex-1">
                {data.awb_code}
              </span>
              <button
                onClick={handleCopy}
                aria-label="Copy tracking number"
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-[#1B3A2D] text-[#FBF7F0] hover:bg-[#C9972D] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-[#1B3A2D]/50 leading-snug">
              Paste this number on the {courierName} official tracking page for live updates.
            </div>
          </div>
        )}

        <div className="mt-2.5 pt-2.5 border-t border-[#1B3A2D]/5 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] text-[#1B3A2D]/60">
            Total <span className="font-semibold text-[#1B3A2D]">₹{data.total}</span>
          </span>
          <div className="flex gap-1.5">
            {trackingUrl ? (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] bg-[#1B3A2D] text-[#FBF7F0] font-semibold px-2.5 py-1 rounded-full hover:bg-[#C9972D] transition-colors"
              >
                Track on {courierName} ↗
              </a>
            ) : data.awb_code ? (
              <a
                href={courierSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] bg-[#1B3A2D] text-[#FBF7F0] font-semibold px-2.5 py-1 rounded-full hover:bg-[#C9972D] transition-colors"
              >
                Open {courierName} ↗
              </a>
            ) : (
              <span className="text-[10px] text-[#1B3A2D]/40 italic">Tracking will be available once shipped</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Product result card
// ──────────────────────────────────────────────
function ProductResultCard({ data }: { data: ProductCardData }) {
  // Build a "₹449 – ₹849" range from weight variants if available; otherwise fall back to base_price
  const prices = (data.weights ?? []).map((w) => w.price).filter((n) => n > 0).sort((a, b) => a - b);
  const priceLabel =
    prices.length >= 2
      ? `₹${prices[0]} – ₹${prices[prices.length - 1]}`
      : prices.length === 1
      ? `₹${prices[0]}`
      : data.base_price
      ? `₹${data.base_price}`
      : "";

  return (
    <a
      href={`/products/${data.slug}`}
      className="flex items-stretch gap-3 bg-white border border-[#C9972D]/30 rounded-xl overflow-hidden shadow-sm hover:border-[#C9972D] hover:shadow-md transition-all duration-200"
    >
      <div className="shrink-0 w-20 h-20 bg-[#FBF7F0] flex items-center justify-center overflow-hidden">
        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.image} alt={data.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-2xl">🍯</span>
        )}
      </div>
      <div className="flex-1 min-w-0 py-2 pr-3 flex flex-col justify-between">
        <div>
          <div className="font-heading font-bold text-[#1B3A2D] text-[13px] leading-tight line-clamp-2">
            {data.name}
          </div>
          {data.badge && (
            <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider font-bold text-[#C9972D]">
              ★ {data.badge}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {priceLabel && (
            <span className="text-[12px] font-semibold text-[#1B3A2D]">{priceLabel}</span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1B3A2D] text-[#FBF7F0] px-2 py-1 rounded-full">
            Buy now ↗
          </span>
        </div>
      </div>
    </a>
  );
}

// ──────────────────────────────────────────────
// Contact card
// ──────────────────────────────────────────────
function ContactCard() {
  return (
    <div className="bg-white border border-[#1B3A2D]/10 rounded-xl p-3 text-[12px] space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[#1B3A2D]/50">WhatsApp</span>
        <a
          href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#1B3A2D] hover:text-[#C9972D]"
        >
          Chat on WhatsApp ↗
        </a>
      </div>
      <div className="flex justify-between">
        <span className="text-[#1B3A2D]/50">Email</span>
        <a href={`mailto:${CONTACT_INFO.email}`} className="font-semibold text-[#1B3A2D] hover:text-[#C9972D] truncate ml-2">
          {CONTACT_INFO.email}
        </a>
      </div>
      <div className="flex justify-between text-[11px] text-[#1B3A2D]/60 pt-1 border-t border-[#1B3A2D]/5">
        <span>Hours</span>
        <span>{CONTACT_INFO.hours}</span>
      </div>
    </div>
  );
}
