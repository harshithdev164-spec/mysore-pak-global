# WhatsApp Bot Enhancement Roadmap

## Current Features ✅
- **Order Tracking** — Order number lookup with status + courier tracking links
- **FAQ Matching** — Smart keyword matching with synonyms, stemming, phrase boost
- **Product Search** — Semantic matching with direct shop links
- **Human Handoff** — Escalation to admin with unmatched queries
- **Multi-turn Sessions** — Stateful conversations for order number entry, product browsing
- **Button Menus** — Interactive buttons for key actions

---

## Tier 1: High-Value Features (Easy to implement)

### 1. **Main Menu with Categorized Buttons**
Replace generic greeting with category buttons. Update `replyGreeting()` to show:
```
[
  { id: "products", title: "🍬 Browse Products" },
  { id: "track_order", title: "📦 Track Order" },
  { id: "faq", title: "❓ FAQs" },
  { id: "promo", title: "🎉 Current Offers" },
  { id: "contact", title: "☎️ Contact Us" }
]
```

**Location:** `src/lib/whatsapp-bot.ts` → `replyGreeting()`  
**Effort:** ~10 mins

---

### 2. **Current Promotions / Offers**
Add a handler for promo button that fetches active promotions from `promotions` table (if exists) or hardcode seasonal offers.

```typescript
async function replyPromotions(from: string): Promise<void> {
  const text = `
🎉 *Current Offers*

💝 *Diwali Special* (valid till Oct 31)
  • Buy 3 items → 15% off
  • Free shipping on orders above ₹1,500
  • Use code: DIWALI15

🎁 *New Customer*
  • 10% off first order
  • Use code: WELCOME10

🏷️ *Bulk Orders*
  • 5+ kg → 20% off
  • Contact: support@worldofmysorepak.com

Check our shop for more: ${SITE}/shop
  `.trim();
  await sendWhatsAppText(from, text);
}
```

**Location:** Add to `src/lib/whatsapp-bot.ts`, hook in `routeIncomingMessage()`  
**Effort:** ~15 mins

---

### 3. **Business Info / Contact Details Menu**
When user asks "contact us", "where are you", "visiting hours", show:

```
📍 *World of Mysore Pak*

🏪 Location
138/B 52-D, 49-D block JC Layout
Chamundi Betta Road, Mysuru 570011

⏰ Hours
Mon–Sun: 10:00 AM – 7:00 PM
(Closed on national holidays)

📞 Contact
WhatsApp: +91 6364895014
Email: support@worldofmysorepak.com
Phone: +91 6364895255

🌐 Website: worldofmysorepak.com
```

**Location:** New function `replyBusinessInfo()` in `src/lib/whatsapp-bot.ts`  
**Effort:** ~10 mins

---

### 4. **FAQ Menu with Categories**
Instead of sending wall of text, show category buttons:

```
Tap a category for the top questions:

[
  { id: "faq_shipping", title: "🚚 Shipping" },
  { id: "faq_payment", title: "💳 Payment" },
  { id: "faq_products", title: "🍬 Products" },
  { id: "faq_returns", title: "↩️ Returns" }
]
```

Then show top 3 FAQs per category, or let user ask a specific question.

**Location:** `src/lib/whatsapp-bot.ts`  
**Effort:** ~20 mins

---

### 5. **Bestsellers / Recommendations**
Add a button to show top-selling products (fetch from `products` table, order by sales/views):

```typescript
async function replyBestsellers(from: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: bestsellers } = await supabase
    .from("products")
    .select("name, slug, weights(price)")
    .order("sales_count", { ascending: false })
    .limit(5);

  const text = `🌟 *Our Bestsellers*\n\n` +
    bestsellers.map(p => {
      const price = p.weights?.[0] ? Math.round(p.weights[0].price) : "N/A";
      return `🍬 *${p.name}* — from ₹${price}\n${SITE}/products/${p.slug}`;
    }).join("\n\n") +
    `\n\nBrowse all: ${SITE}/shop`;

  await sendWhatsAppText(from, text);
}
```

**Location:** New in `src/lib/whatsapp-bot.ts`  
**Effort:** ~15 mins

---

## Tier 2: Medium-Value Features (Moderate effort)

### 6. **Festival Hampers & Gifting**
Add gifting submenu with curated hampers (Diwali, wedding, corporate, etc.):

```
🎁 *Gifting & Hampers*

Select an occasion:
[
  { id: "gift_diwali", title: "🪔 Diwali Hamper" },
  { id: "gift_wedding", title: "💒 Wedding Gifting" },
  { id: "gift_corporate", title: "🏢 Corporate Orders" },
  { id: "gift_bulk", title: "📦 Bulk / Wholesale" }
]
```

Store hamper definitions in `src/lib/chatbot-flows.ts` and fetch dynamic pricing.

**Location:** `src/lib/whatsapp-bot.ts`  
**Effort:** ~30–45 mins

---

### 7. **Order Before / Pre-Order Booking**
Allow users to pre-order items coming soon:

```
Hmm, that item is sold out, but coming back soon!

Would you like me to:
[
  { id: "preorder_yes", title: "✅ Notify me when back" },
  { id: "preorder_no", title: "❌ Show alternatives" }
]
```

Store in `wa_preorders` table with phone + product_id + timestamp.

**Location:** Enhance `replyProductMatches()` in `src/lib/whatsapp-bot.ts`  
**Effort:** ~25 mins

---

### 8. **Serviceable Pincode Checker**
User can ask "Do you ship to [city/pincode]?" → Check if DTDC/DHL/Delhivery service available:

```typescript
async function replyPincodeServiceability(
  from: string,
  pincode: string
): Promise<void> {
  const serviceable = await checkServiceability(pincode);
  const text = serviceable
    ? `✅ Yes, we ship to pincode ${pincode}! Delivery in 3–5 business days.`
    : `❌ Sorry, we can't deliver to pincode ${pincode} yet. Check back soon or email us at support@worldofmysorepak.com`;

  await sendWhatsAppText(from, text);
}
```

**Location:** New in `src/lib/whatsapp-bot.ts`, hook in router  
**Effort:** ~20 mins

---

### 9. **Social Proof & Reviews**
Show recent positive reviews and rating:

```
⭐ *What our customers say*

"Best Mysore Pak I've had! So pure and fresh!" — Anita, Bangalore

"Perfect for gifting. Arrived beautifully packaged." — Rohit, Delhi

"Authentic taste, delivery on time." — Priya, Pune

Read more reviews: ${SITE}/shop (scroll to reviews)
```

**Location:** New function, fetch from `reviews` table  
**Effort:** ~15 mins

---

### 10. **Loyalty / Referral Program**
Inform users about referral bonuses:

```
🎯 *Refer a Friend*

Share your unique code: CUST_[PHONE]
They get 10% off first order
You get ₹100 credit

Learn more: ${SITE}/refer-friend
```

**Location:** New handler in `src/lib/whatsapp-bot.ts`  
**Effort:** ~20 mins

---

## Tier 3: Advanced Features (Higher effort)

### 11. **Conversational AI (Upgrade to Claude/GPT)**
Replace rule-based FAQ with an LLM that can:
- Answer nuanced questions ("What's the difference between jaggery and sugar mysore pak?")
- Generate personalized recommendations
- Handle typos and casual language better

**Integration:** Use Anthropic Claude API in `routeIncomingMessage()` as fallback after FAQ matching fails.

**Location:** New `src/lib/whatsapp-llm.ts`  
**Effort:** ~1–2 hours

---

### 12. **Multi-Language Support (Hindi, Kannada)**
Detect language and respond in same language:

```typescript
function detectLanguage(text: string): "en" | "hi" | "kn" {
  // Simple regex: if text contains devanagari/kannada chars, detect lang
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  return "en";
}
```

Maintain separate FAQ + reply templates for each language.

**Location:** `src/lib/whatsapp-bot.ts`, new `src/lib/whatsapp-i18n.ts`  
**Effort:** ~2–3 hours

---

### 13. **Abandoned Cart Recovery**
Track when users add items to cart but don't checkout. Send reminder:

```
👋 *Did you forget something?*

You left these in your cart:
🍬 Kaju Mysore Pak (500g) — ₹450
🍬 Chocolate Bites (250g) — ₹300

Complete your order (free shipping!): ${SITE}/cart
```

**Location:** Listen to checkout webhook, schedule WA message  
**Effort:** ~1 hour

---

### 14. **Size / Weight Recommendation**
Help users choose correct weight based on occasion:

```
🤔 *How much should I order?*

Tell me the occasion:
[
  { id: "rec_personal", title: "🍴 Just for me" },
  { id: "rec_family", title: "👨‍👩‍👧‍👦 Family (4–5 people)" },
  { id: "rec_gift", title: "🎁 Gift for friends" },
  { id: "rec_bulk", title: "📦 Bulk order" }
]
```

Suggest quantities + bundle savings.

**Location:** `src/lib/whatsapp-bot.ts`  
**Effort:** ~20 mins

---

### 15. **Order Issue Resolution**
Auto-handle common issues (missing item, damaged, delayed shipment):

```
😞 *There's a problem with my order*

What happened?
[
  { id: "issue_damaged", title: "📦 Item damaged" },
  { id: "issue_missing", title: "❌ Item missing" },
  { id: "issue_delayed", title: "⏳ Delivery delayed" },
  { id: "issue_quality", title: "🤔 Quality issue" }
]
```

Auto-collect details (order #, photo if possible), create ticket in admin panel.

**Location:** `src/lib/whatsapp-bot.ts`  
**Effort:** ~45 mins

---

## Tier 4: Wishful Thinking (Very Advanced)

### 16. **Payment Collection via WhatsApp**
Integrate Razorpay to allow users to pay directly in WhatsApp (when Razorpay adds native WA support).

### 17. **AI-Powered Video Recommendations**
Send short video clips of products, preparation, or customer testimonials.

### 18. **Subscription Boxes**
Let users subscribe to monthly hampers delivered automatically with discounts.

### 19. **AR Try-On** (e.g., visualize Mysore Pak on table before buying)

---

## Quick Implementation Checklist

### Phase 1 (This Week) — Immediate wins
- [ ] Main menu with 5 category buttons
- [ ] Promotions reply
- [ ] Business info reply
- [ ] Bestsellers handler
- [ ] FAQ categories with buttons

### Phase 2 (Next 1–2 weeks) — Medium impact
- [ ] Gifting/hamper submenu
- [ ] Pincode checker
- [ ] Pre-order handler
- [ ] Loyalty program snippet
- [ ] Referral link in greeting

### Phase 3 (Monthly) — Polish & AI
- [ ] Multi-language support (Hindi + Kannada)
- [ ] LLM fallback for complex FAQs
- [ ] Order issue resolution flow
- [ ] Abandoned cart recovery

### Phase 4 (Quarterly) — Premium features
- [ ] Payment integration
- [ ] Subscription box offer
- [ ] Analytics dashboard

---

## Code Structure Tips

1. **New Reply Functions:** Add to `src/lib/whatsapp-bot.ts`
   ```typescript
   async function replyXxxx(from: string, ...args): Promise<void> {
     const text = `...`;
     await sendWhatsAppText(from, text);
   }
   ```

2. **Button Handlers:** Add `buttonId` checks in `routeIncomingMessage()`:
   ```typescript
   if (buttonId === "promo") {
     await replyPromotions(from);
     return;
   }
   ```

3. **FAQ Expansion:** Add entries to `FAQ_ENTRIES` in `src/lib/chatbot-flows.ts`

4. **Session State:** Use `getWaSession()` / `setWaSession()` for multi-turn flows

---

## Suggested Priority Order
1. **Main Menu + Categories** (foundational)
2. **Promotions + Business Info** (engagement)
3. **Bestsellers + FAQ Categories** (discovery)
4. **Gifting + Pre-order** (revenue)
5. **Pincode Checker** (UX)
6. **LLM Upgrade** (quality)
7. **Multi-language** (market expansion)
