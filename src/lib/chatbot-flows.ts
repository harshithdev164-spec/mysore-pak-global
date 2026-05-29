/**
 * Chatbot flows + FAQ content.
 *
 * Designed to be channel-agnostic so the same flows can be reused for the
 * upcoming WhatsApp bot — keep all message text and option lists here, not in
 * the UI component.
 */

export type FlowState =
  | "main_menu"
  | "track_prompt"          // bot asked for order number
  | "track_result"          // bot showed tracking result
  | "faq_categories"        // bot showed FAQ category buttons
  | "faq_questions"         // bot showed questions for a category
  | "faq_answer"            // bot showed an answer
  | "shipping_info"
  | "contact"
  | "human";

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
}

export const MAIN_MENU_ACTIONS: QuickAction[] = [
  { id: "track", label: "📦 Track my order" },
  { id: "browse", label: "🍯 Browse products" },
  { id: "faq", label: "❓ Frequently asked" },
  { id: "shipping", label: "🚚 Shipping info" },
  { id: "contact", label: "📞 Contact us" },
];

// Categories shown after tapping "🍯 Browse products". `slug` matches the DB
// `categories.slug` so we can filter products server-side.
export const BROWSE_CATEGORIES: { id: string; label: string; slug: string }[] = [
  { id: "cat_mysore-pak", label: "🍯 Mysore Pak", slug: "mysore-pak" },
  { id: "cat_chocolates", label: "🍫 Chocolates", slug: "chocolates" },
  { id: "cat_halwa", label: "🥣 Halwa", slug: "halwa" },
  { id: "cat_soan-cake", label: "🍰 Soan Cake", slug: "soan-cake" },
  { id: "cat_mixtures", label: "🌶️ Namkeen & Mixtures", slug: "namkeen" },
  { id: "cat_gift", label: "🎁 Gift Boxes", slug: "gift-boxes" },
];

// Occasion-based shortcuts. Each maps to a free-text query that the products
// endpoint runs against product name / description.
export const BROWSE_OCCASIONS: { id: string; label: string; q: string }[] = [
  { id: "occ_festival", label: "✨ Festival gifting", q: "festival gift" },
  { id: "occ_diwali", label: "🪔 Diwali special", q: "diwali" },
  { id: "occ_premium", label: "💎 Premium box", q: "premium gift" },
  { id: "occ_daily", label: "🍵 Daily snack", q: "daily snack" },
];

export const FAQ_CATEGORIES: QuickAction[] = [
  { id: "shipping", label: "Shipping & delivery" },
  { id: "payment", label: "Payment" },
  { id: "returns", label: "Returns & refunds" },
  { id: "products", label: "Products & freshness" },
];

export interface FaqEntry {
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  // Shipping
  {
    category: "shipping",
    question: "How long does delivery take?",
    answer:
      "Within India: 2–5 business days (Delhivery Express). International: 3–10 business days depending on destination. Use the Track my order option in this chat to see live status once your order is shipped.",
  },
  {
    category: "shipping",
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship to USA, UK, UAE, Saudi Arabia, Qatar, Singapore, Canada, Australia, Germany, Malaysia, Oman, and Kuwait via DHL Express or Delhivery International. Customs duties are paid by the recipient on delivery.",
  },
  {
    category: "shipping",
    question: "Is there free shipping?",
    answer:
      "Yes — free shipping on all India domestic orders above ₹1,500. International orders are charged actual courier rates.",
  },
  {
    category: "shipping",
    question: "Can I change my delivery address after ordering?",
    answer:
      "If the order hasn't shipped yet, yes — call us at +91 63648 95255 within 2 hours of placing the order. Once shipped, the address can no longer be changed.",
  },

  // Payment
  {
    category: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, all major credit/debit cards, net banking, and wallets via Razorpay. International customers can pay with international cards.",
  },
  {
    category: "payment",
    question: "Is my payment information secure?",
    answer:
      "Absolutely. Payments are processed by Razorpay — a PCI-DSS certified gateway. We never see or store your card details.",
  },
  {
    category: "payment",
    question: "I was charged but didn't receive a confirmation. What now?",
    answer:
      "Check your spam folder for the confirmation email. If you don't see it within 30 minutes, please contact us at support@worldofmysorepak.com with your payment reference number and we'll resolve it immediately.",
  },

  // Returns
  {
    category: "returns",
    question: "What's your return policy?",
    answer:
      "Because sweets are perishable, we don't accept returns once delivered. However if the product arrives damaged or spoiled, contact us within 24 hours with photos and we'll replace or refund it.",
  },
  {
    category: "returns",
    question: "How do I report a damaged or missing item?",
    answer:
      "Email support@worldofmysorepak.com with your order number and photos of the damage within 24 hours of delivery. We'll process a replacement or refund within 3 business days.",
  },
  {
    category: "returns",
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled within 2 hours of placement, provided they haven't been shipped yet. Use the live chat or call +91 63648 95255 to cancel — refunds reach you within 5–7 business days.",
  },

  // Products
  {
    category: "products",
    question: "How long does Mysore Pak stay fresh?",
    answer:
      "Our Mysore Pak stays fresh for up to 15 days when stored in an airtight container at room temperature. Refrigeration is not required but extends shelf life to 30+ days.",
  },
  {
    category: "products",
    question: "Are your products purely vegetarian?",
    answer:
      "Yes, 100% vegetarian. Made with pure cow ghee, gram flour, and sugar — the original recipe from the royal kitchen of Mysuru, unchanged for over a century.",
  },
  {
    category: "products",
    question: "Do you make sugar-free or diabetic-friendly versions?",
    answer:
      "Not currently — Mysore Pak is by definition a sugar-based sweet. We're exploring a low-sugar variant for 2026. Subscribe to our newsletter to be the first to know.",
  },
  {
    category: "products",
    question: "Are products gluten-free?",
    answer:
      "Most of our sweets use gram flour (besan) and are naturally gluten-free. Check the ingredient list on each product page to confirm — some specialty items contain wheat-based ingredients.",
  },
];

export function getFaqsForCategory(categoryId: string): FaqEntry[] {
  return FAQ_ENTRIES.filter((f) => f.category === categoryId);
}

export const CONTACT_INFO = {
  phone: "+91 63648 95255",
  whatsapp: "+91 63648 95255",
  email: "support@worldofmysorepak.com",
  hours: "Mon–Sat, 9 AM – 7 PM IST",
  address: "Mysuru, Karnataka, India 570011",
};

export const SHIPPING_BLURB = `We ship across India via Delhivery Express (2–5 days) and internationally via DHL Express or Delhivery International (3–10 days).

• Free shipping on India orders above ₹1,500
• Real-time tracking once shipped — use **Track my order** in this chat anytime
• Customs duties on international orders paid by recipient on delivery

Need a rate quote? Just enter your pincode/postal code at checkout.`;

// Simple keyword matching for free-form input → which flow to enter.
// Order matters: tracking and product-browse share words like "order" — track wins
// only when explicit tracking keywords appear.
export function classifyIntent(
  text: string
): "track" | "browse" | "faq" | "shipping" | "contact" | "unknown" {
  const t = text.toLowerCase();
  // Tracking: explicit status / shipment language
  if (/(track|status|where.*order|where.*parcel|awb|courier|shipment|delivered)/.test(t))
    return "track";
  // Product browse: any mention of a sweet category, dietary terms, or "show me"
  if (
    /(mysore\s*pak|chocolate|halwa|soan|namkeen|mixture|gift\s*box|sugar.?free|diabetic|premium|festival|diwali|product|sweet|buy|show me|browse|recommend|cart)/.test(
      t
    )
  )
    return "browse";
  if (/(faq|question|help|how|why|when|what)/.test(t)) return "faq";
  if (/(ship|delivery|free shipping|international|pincode|postal)/.test(t)) return "shipping";
  if (/(contact|call|email|whatsapp|human|support|talk to)/.test(t)) return "contact";
  return "unknown";
}

// Status label + friendly description for order tracking.
export const STATUS_LABELS: Record<
  string,
  { emoji: string; title: string; description: string }
> = {
  pending: {
    emoji: "⏳",
    title: "Pending",
    description: "Your order is waiting for payment confirmation.",
  },
  confirmed: {
    emoji: "✅",
    title: "Confirmed",
    description: "Payment received! We're preparing your sweets.",
  },
  pickup: {
    emoji: "📦",
    title: "Pickup scheduled",
    description: "Waybill generated. Courier will pick up your package soon.",
  },
  processing: {
    emoji: "🔄",
    title: "Processing",
    description: "Your order is being processed at the courier hub.",
  },
  shipped: {
    emoji: "🚚",
    title: "Shipped",
    description: "On its way! Track using the AWB number below.",
  },
  delivered: {
    emoji: "🎉",
    title: "Delivered",
    description: "Hope you're enjoying your Mysore Pak!",
  },
  cancelled: {
    emoji: "❌",
    title: "Cancelled",
    description: "This order was cancelled. Contact us if you have questions.",
  },
};
