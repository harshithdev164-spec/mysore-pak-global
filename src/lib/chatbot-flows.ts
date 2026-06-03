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

  // ─────────────────────────────────────────────
  // Extended FAQ — shipping
  // ─────────────────────────────────────────────
  {
    category: "shipping",
    question: "Do you offer cash on delivery (COD)?",
    answer:
      "COD is available on most India domestic orders below ₹3,000. The option appears at checkout if your pincode is serviceable. Prepaid orders qualify for occasional discount codes — keep an eye on the homepage banner.",
  },
  {
    category: "shipping",
    question: "How do I track my order?",
    answer:
      "Reply with your order number (e.g. *0363* or *WMP-0363*) here and I'll send the live status, courier, and AWB tracking link. You'll also get an automatic WhatsApp update when the courier picks it up and when it's delivered.",
  },
  {
    category: "shipping",
    question: "My order is late — what now?",
    answer:
      "Sorry about that! Reply with your order number and I'll check the latest tracking. If the courier shows no movement for more than 48 hours, our team escalates immediately — usually resolves within a day.",
  },
  {
    category: "shipping",
    question: "What if no one is home for delivery?",
    answer:
      "The courier will attempt re-delivery up to 2 more times. You can also call them directly with the AWB number to reschedule. After 3 failed attempts, the package returns to us and we issue a refund (minus return shipping for COD orders).",
  },
  {
    category: "shipping",
    question: "Which courier do you use?",
    answer:
      "We use DTDC Express, Delhivery, and (for international) DHL Express. The courier is chosen automatically based on serviceability and cost. You'll see the courier name on your shipping confirmation message.",
  },
  {
    category: "shipping",
    question: "Do you deliver to my pincode?",
    answer:
      "We cover 25,000+ Indian pincodes. Add a product to cart, enter your pincode at checkout, and you'll see the live rate + estimated delivery date instantly. If your area isn't serviceable, the system tells you upfront.",
  },
  {
    category: "shipping",
    question: "Can I get same-day or next-day delivery in Mysuru?",
    answer:
      "Yes — local Mysuru orders placed before 2 PM are delivered the same day by hand-courier. Reply with your area name and we'll confirm.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — payment
  // ─────────────────────────────────────────────
  {
    category: "payment",
    question: "Are there any EMI options?",
    answer:
      "EMI is available on most credit cards through Razorpay at checkout — minimum order value typically ₹3,000. You'll see EMI options on the payment page if your card is eligible.",
  },
  {
    category: "payment",
    question: "My payment failed but money was deducted",
    answer:
      "If you don't see a confirmation within 30 minutes, the payment was likely refunded automatically by your bank within 5–7 business days. Forward us the bank SMS with the reference and we'll also confirm on Razorpay's end. Email: support@worldofmysorepak.com",
  },
  {
    category: "payment",
    question: "Do you accept international cards?",
    answer:
      "Yes — Visa, Mastercard, and Amex international cards work via Razorpay. We charge in INR and your card issuer applies the FX rate.",
  },
  {
    category: "payment",
    question: "How long do refunds take?",
    answer:
      "Refunds are initiated within 24–48 hours of approval. UPI: 1–2 days. Cards/Netbanking: 5–7 business days. COD refunds (rare): we transfer to your bank — share the IFSC/account.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — returns & cancellations
  // ─────────────────────────────────────────────
  {
    category: "returns",
    question: "What if my package arrives damaged?",
    answer:
      "Open it in front of the delivery person if possible. Take photos and message us here within 24 hours with the order number. We replace or refund free of cost — no questions, no return shipping.",
  },
  {
    category: "returns",
    question: "Item missing from my order",
    answer:
      "Send a photo of the unpacked order + the invoice within 24 hours of delivery. We'll dispatch the missing item the same day or refund its value, your choice.",
  },
  {
    category: "returns",
    question: "Can I exchange for a different product?",
    answer:
      "Because sweets are perishable, we can't take returns for exchange. If you ordered the wrong product by mistake, contact us within 1 hour of placing the order — we'll usually accommodate.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — products & ingredients
  // ─────────────────────────────────────────────
  {
    category: "products",
    question: "What ghee do you use?",
    answer:
      "We use pure cow ghee, sourced fresh from local Mysuru dairy farms. No artificial fats, no palm oil, no vanaspati. Ever.",
  },
  {
    category: "products",
    question: "Do you use refined sugar or jaggery?",
    answer:
      "Standard Mysore Pak uses cane sugar. We also offer *Jaggery Mysore Pak*, *Jaggery Millet Mysore Pak*, and *Anjeer Mysore Pak* (sweetened with figs) for jaggery/natural-sweetener lovers. Ask for any of these by name!",
  },
  {
    category: "products",
    question: "Are products organic?",
    answer:
      "Our Jaggery Millet Mysore Pak uses organic jaggery and organic millets. Other products use conventional but high-grade ingredients. We're working towards more organic SKUs.",
  },
  {
    category: "products",
    question: "Any nut-free options?",
    answer:
      "Yes — Traditional Mysore Pak, Mango Mysore Pak, Milk Mysore Pak, and Carrot Mysore Pak are all nut-free. Avoid Kaju, Badam, Pista, and Hazelnut variants if you have a nut allergy.",
  },
  {
    category: "products",
    question: "Are products dairy-free / vegan?",
    answer:
      "Most of our sweets contain ghee (clarified butter) or milk solids, so they aren't vegan. Some snacks (Chakkuli, Mixture, Khakhra) are dairy-free — check the ingredient list on each product page.",
  },
  {
    category: "products",
    question: "How should I store the sweets?",
    answer:
      "Airtight container, cool dry place, away from direct sunlight. Refrigeration is optional but extends shelf life to 30+ days. Bring to room temperature before eating for best texture.",
  },
  {
    category: "products",
    question: "Are products fresh — when were they made?",
    answer:
      "Everything is made fresh in small batches in our Mysuru kitchen — typically within 48 hours of dispatch. Manufacturing and best-before dates are printed on every pack.",
  },
  {
    category: "products",
    question: "Do you have allergen labelling?",
    answer:
      "Every product page lists ingredients clearly. Common allergens (nuts, dairy, wheat) are flagged. If you have a specific allergy, message us with the product name and we'll confirm.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — ordering
  // ─────────────────────────────────────────────
  {
    category: "ordering",
    question: "Is there a minimum order?",
    answer:
      "No minimum. Order a single 100g pack if you like. Free shipping kicks in above ₹1,500 on Indian orders.",
  },
  {
    category: "ordering",
    question: "How do I place an order?",
    answer:
      "Browse https://www.worldofmysorepak.com/shop, add to cart, checkout. Or tell me which product you want here on WhatsApp (e.g. \"I want 500g Kaju Mysore Pak\") and I'll send you a direct link.",
  },
  {
    category: "ordering",
    question: "Can I add a gift message?",
    answer:
      "Yes — there's a *Gift message* field at checkout. Up to 200 characters; we print it on a small card tucked inside the box. Free.",
  },
  {
    category: "ordering",
    question: "Do you offer gift wrapping?",
    answer:
      "All our boxes are already gift-quality — gold wrap, ribbon, brand seal. For festival hampers and corporate gifting (10+ boxes), we have premium packaging options. Reply *bulk* or *corporate* for details.",
  },
  {
    category: "ordering",
    question: "Can I order without creating an account?",
    answer:
      "Yes — guest checkout is supported. You can still track via order number on WhatsApp or the website.",
  },
  {
    category: "ordering",
    question: "How do I add a delivery instruction?",
    answer:
      "On the checkout page there's a *Order notes* field — landmark, gate code, preferred time, anything. The courier and our team both see this.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — gifting & corporate
  // ─────────────────────────────────────────────
  {
    category: "gifting",
    question: "Do you do bulk or corporate gifting?",
    answer:
      "Yes! Corporate festival hampers, employee gifting, wedding favours — minimum 10 boxes. Custom branding, custom message cards, bulk pricing. Email corporate@worldofmysorepak.com or message here with quantity and date, we'll send a quote within 24 hours.",
  },
  {
    category: "gifting",
    question: "Can you ship to multiple addresses?",
    answer:
      "For bulk gifting yes — we accept an Excel sheet with names + addresses + custom messages. Each recipient gets a personalised pack. For regular orders, please place separate orders per address.",
  },
  {
    category: "gifting",
    question: "What's good for Diwali / festival gifting?",
    answer:
      "Top sellers: *Mix Mysore Pak*, *Fruit & Nut Milk Chocolate*, *Chocolate Bites*, *Roasted Almond Mysore Pak*. We also do festival hampers — message *hamper* or check https://www.worldofmysorepak.com/shop?category=gift-boxes",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — brand & store
  // ─────────────────────────────────────────────
  {
    category: "brand",
    question: "Where are you based?",
    answer:
      "Mysuru, Karnataka — the birthplace of Mysore Pak. Our kitchen is in Nazarbad Mohalla, near Chamundi Hills. Pickup is available on request.",
  },
  {
    category: "brand",
    question: "Do you have a physical store?",
    answer:
      "Yes — visit us at 138/B 52-D, 49-D block, JC Layout, Chamundi Betta Road, Nazarbad Mohalla, Mysuru 570011. Open Mon–Sat 9 AM–7 PM. Free tastings!",
  },
  {
    category: "brand",
    question: "What's the story behind World of Mysore Pak?",
    answer:
      "Mysore Pak was invented in the royal kitchen of Mysuru over a century ago. We've preserved the original recipe — pure cow ghee, gram flour, sugar — and added modern variants (chocolate, jaggery, millet, fruit). Read more: https://www.worldofmysorepak.com/our-story",
  },
  {
    category: "brand",
    question: "Are you FSSAI certified?",
    answer:
      "Yes — FSSAI registered and audited. Our license number is printed on every pack. Hygiene-first kitchen, regular quality checks.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — contact & hours
  // ─────────────────────────────────────────────
  {
    category: "contact",
    question: "What are your working hours?",
    answer:
      "Customer support: Mon–Sat, 9 AM – 7 PM IST. WhatsApp messages (this chat) are answered within 1 hour during working hours, otherwise next morning. Online orders are accepted 24/7.",
  },
  {
    category: "contact",
    question: "How do I contact a human?",
    answer:
      "Reply with anything I can't answer and I'll connect you to our team. Or call +91 63648 95255 / 95254 during working hours, or email support@worldofmysorepak.com.",
  },
  {
    category: "contact",
    question: "What's your WhatsApp number?",
    answer:
      "You're already on it! Our WhatsApp Business number is *+91 63648 95293*. Save it so order updates land in this same chat.",
  },
  {
    category: "contact",
    question: "Where can I follow you on social media?",
    answer:
      "Instagram: @worldofmysorepak, Facebook: /worldofmysorepak. Daily product reels, behind-the-scenes from our Mysuru kitchen, festival drops.",
  },

  // ─────────────────────────────────────────────
  // Extended FAQ — quality & manufacturing
  // ─────────────────────────────────────────────
  {
    category: "quality",
    question: "How is the quality so consistent?",
    answer:
      "Small-batch production, the same master sweet-maker oversees every batch, ingredient ratios are weighed (not eyeballed), and every batch is taste-checked before packing. If anything ever feels off, we replace it — no questions.",
  },
  {
    category: "quality",
    question: "How do you maintain freshness during shipping?",
    answer:
      "Vacuum-sealed inner pouch + cushioned outer box + same-day-of-dispatch courier pickup. Sweets reach you within 2–5 days of being made. The vacuum seal locks in flavour.",
  },

  // ─────────────────────────────────────────────
  // Discounts / coupons / first-order
  // ─────────────────────────────────────────────
  {
    category: "discounts",
    question: "Do you have any discount or coupon code?",
    answer:
      "Active offers are pinned at the top of https://www.worldofmysorepak.com — usually a first-order code and a festival drop. Sign up to our newsletter (footer) to get codes by email before anyone else.",
  },
  {
    category: "discounts",
    question: "Any first-order discount?",
    answer:
      "Yes — check the homepage banner for the current first-order coupon. Apply it at checkout.",
  },
  {
    category: "discounts",
    question: "Is there free shipping or free gift on bulk orders?",
    answer:
      "Free shipping on India orders above ₹1,500. Bulk orders (10+ boxes) get tiered discounts AND complimentary upgraded packaging — reply *bulk* or email corporate@worldofmysorepak.com for a quote.",
  },

  // ─────────────────────────────────────────────
  // GST / invoicing / B2B
  // ─────────────────────────────────────────────
  {
    category: "invoicing",
    question: "Do you provide a GST invoice?",
    answer:
      "Yes — a GST tax invoice is auto-generated with every order and emailed to you. For B2B / company billing with your GSTIN on the invoice, add the GSTIN in the *Order notes* field at checkout (or reply here with your order number + GSTIN and we'll re-issue).",
  },
  {
    category: "invoicing",
    question: "How do I get a B2B invoice with my company GSTIN?",
    answer:
      "Mention your company name + GSTIN in the *Order notes* field at checkout, OR reply here with order number + GSTIN after placing the order and we'll re-issue within a few hours.",
  },

  // ─────────────────────────────────────────────
  // Delivery edge cases
  // ─────────────────────────────────────────────
  {
    category: "shipping",
    question: "Do you deliver on Sundays and holidays?",
    answer:
      "Courier delivery happens Monday–Saturday across India. On Sundays and bank holidays, deliveries pause and resume the next working day. We dispatch all 7 days though, so weekend orders still leave our kitchen on time.",
  },
  {
    category: "shipping",
    question: "Can I get express / 1-day delivery?",
    answer:
      "Same-day delivery is available within Mysuru city for orders placed before 2 PM. Outside Mysuru, fastest is 2-3 days via DTDC B2C Priority — already our default. We don't currently offer overnight intercity.",
  },
  {
    category: "shipping",
    question: "Why is delivery taking so long?",
    answer:
      "Sorry about the delay! Reply with your order number and I'll fetch the live tracking. If the courier shows no movement for 48+ hours, we escalate with the courier hub immediately — usually resolves the next day.",
  },

  // ─────────────────────────────────────────────
  // Payment edge cases
  // ─────────────────────────────────────────────
  {
    category: "payment",
    question: "Can I pay by QR code or scan?",
    answer:
      "Yes — the checkout page shows a Razorpay UPI QR option. Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) → confirm → you're back on the order page in seconds.",
  },
  {
    category: "payment",
    question: "Can I pay by bank transfer / NEFT?",
    answer:
      "Not directly at checkout, but for orders above ₹5,000 we can share bank details on request. Reply here with the order amount and we'll set it up.",
  },

  // ─────────────────────────────────────────────
  // Multi-language / common Hindi/Kannada queries
  // ─────────────────────────────────────────────
  {
    category: "shipping",
    question: "Kab milega mera order? (When will I get my order?)",
    answer:
      "Aapke order ko deliver hone mein 2-5 din lagte hain (India ke andar). Apna order number bhej dijiye aur main turant live status bata dunga.",
  },
  {
    category: "shipping",
    question: "Mumbai / Delhi / Bangalore — do you deliver here?",
    answer:
      "Haan ji 🙏 We deliver to 25,000+ pincodes across India including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune. Pincode check at checkout shows live rate + ETA.",
  },
  {
    category: "payment",
    question: "Kitna paisa lagta hai shipping ka?",
    answer:
      "₹1,500 se upar ke order pe shipping FREE hai India ke andar. Usse kam pe ₹99 flat. International orders ke liye live courier rate hai.",
  },

  // ─────────────────────────────────────────────
  // Festival / seasonal
  // ─────────────────────────────────────────────
  {
    category: "gifting",
    question: "Diwali / festival gift hampers?",
    answer:
      "Yes — limited-edition festival hampers drop 3-4 weeks before each major festival (Diwali, Raksha Bandhan, Christmas, New Year). Browse: https://www.worldofmysorepak.com/shop?category=gift-boxes",
  },
  {
    category: "gifting",
    question: "Wedding / corporate gifting options?",
    answer:
      "For weddings, anniversaries, corporate Diwali — minimum 10 boxes with custom branding, custom message cards, choice of packaging. Email corporate@worldofmysorepak.com with date + quantity for a quote within 24h.",
  },

  // ─────────────────────────────────────────────
  // Product specifics that customers ask about often
  // ─────────────────────────────────────────────
  {
    category: "products",
    question: "Which is your bestseller?",
    answer:
      "Our most loved: *Traditional Mysore Pak*, *Kaju Mysore Pak*, and *Chocolate Bites*. For first-time buyers, try our *Mix Mysore Pak* — three classic flavours in one box.",
  },
  {
    category: "products",
    question: "Difference between regular Mysore Pak and Kaju Mysore Pak?",
    answer:
      "Traditional Mysore Pak uses besan (gram flour), pure cow ghee, sugar. Kaju Mysore Pak adds finely ground cashews to the same recipe — richer, slightly nuttier, premium. Both melt in the mouth.",
  },
  {
    category: "products",
    question: "Tell me about your jaggery / millet variants",
    answer:
      "We make three jaggery-based options: *Jaggery Mysore Pak*, *Jaggery Millet Mysore Pak* (organic foxtail millet + jaggery), and *Anjeer Mysore Pak* (sweetened with figs). All lower-glycemic than regular sugar variants.",
  },
  {
    category: "products",
    question: "Do you have anything for someone with allergies?",
    answer:
      "Tell me the allergy and I'll suggest. Nut-free: Traditional, Mango, Milk, Carrot Mysore Pak. Gluten-free: most besan-based items (check ingredient list). Dairy-free is harder — most use ghee — but Chakkuli, Mixture, Khakhras work.",
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
