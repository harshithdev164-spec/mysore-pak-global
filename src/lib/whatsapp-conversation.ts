/**
 * Conversational micro-intent layer for the WhatsApp bot.
 *
 * Sits BETWEEN the order-number/keyword shortcuts and the FAQ/product
 * matchers. Handles the "small" human moments — thanks, ok, hmm, bye,
 * compliments, frustration, single-character pings — with warm,
 * varied responses in English / Hindi / Kannada / mixed scripts.
 *
 * Returns `true` if the message was handled (caller should `return`),
 * `false` if the caller should fall through to FAQ/product matching.
 */

import {
  sendWhatsAppText,
  sendWhatsAppButtons,
  clearWaSession,
  setWaSession,
} from "@/lib/whatsapp";

// ──────────────────────────────────────────────
// Response variety — pick at random so the same intent doesn't repeat
// the same canned phrase three messages in a row.
// ──────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const REPLIES = {
  thanks: [
    "You're very welcome! 😊 Is there anything else I can help you with?",
    "Anytime! 💛 Let me know if you need anything else.",
    "Glad I could help! Reach out whenever you need us.",
    "Most welcome! 🙏 Happy to help with anything else.",
  ],
  compliment: [
    "Thank you so much! 💛 That really means a lot. Is there anything else I can help with?",
    "Aww, thank you! 😊 We work hard to keep it that way. Anything else I can do for you?",
    "You just made our day! 🥰 Let me know if there's anything else.",
    "🙏 Means a lot — we'll pass it on to the kitchen team! Anything else?",
  ],
  goodbye: [
    "Thank you for visiting World of Mysore Pak! Have a sweet day 👋💛",
    "Take care! We're here whenever you need us. 🙏",
    "Goodbye for now! Visit anytime — and enjoy your sweets 🍬",
    "Phir milte hain! 👋 Have a wonderful day.",
  ],
  ack: [
    "Got it 😊. Let me know if you need help with an order, our products, or anything else.",
    "Sure thing! I'm here whenever you need me.",
    "👍 Happy to help with anything else — products, orders, delivery, payment, all of it.",
    "Okay! Feel free to ask anytime.",
  ],
  hmm: [
    "No worries 😊. Take your time — I'm here whenever you're ready to ask.",
    "All good! Let me know when you'd like to continue.",
    "Take your time 🙂. Ready to help whenever you are.",
  ],
  yes: [
    "Wonderful! 😊 What would you like to do next?",
    "Great! Tell me a bit more so I can help right.",
    "Lovely! Go ahead and let me know what you'd like to do.",
  ],
  no: [
    "Alright 😊. If you change your mind, I'm right here.",
    "No problem! Reach out anytime — we're always happy to help.",
    "Got it 🙏. I'm here if you need anything later.",
  ],
  confused_again: [
    "Of course! Could you tell me which part you'd like me to share again?",
    "Happy to repeat 😊 — which info would you like one more time?",
    "Sure thing! What would you like me to go over again?",
  ],
  frustration: [
    "I'm really sorry you're facing this 🙏 — let me flag it to our team straight away. Could you share your order number so I can pull it up immediately?",
    "So sorry about the trouble 💛. I want to fix this for you — please share your order number (e.g. *0363*) or describe what went wrong and I'll get our team on it right now.",
    "I hear you 🙏 and I'm sorry. Drop your order number here and I'll personally make sure our team looks into it today.",
  ],
  vague_order: [
    "I'd be happy to check that for you! Could you share your *order number* (e.g. *0363*) or the registered mobile number?",
    "Sure — please share your order number from the confirmation email/SMS, and I'll pull up the live status.",
  ],
  vague_product: [
    "I'd love to help! Could you tell me which product you have in mind — Mysore Pak, Chocolate Bites, Kaju Barfi…? Or browse all: https://www.worldofmysorepak.com/shop",
    "Happy to help with pricing 😊. Which product caught your eye?",
  ],
  vague_dot: [
    "Hello 😊! How can I help you today?",
    "Hi there 👋! Did you mean to send a question?",
  ],
  vague_q: [
    "I'd be glad to help! Could you tell me what you're looking for? (Track an order, browse products, ingredients, delivery — anything!)",
    "Sure 😊 — could you share a little more about what you'd like to know?",
  ],
  bulk_intent: [
    "That's a wonderful idea! 😊 We do plenty of corporate and bulk gifting. Roughly how many boxes do you need, and by when? Reply here or email corporate@worldofmysorepak.com — we'll send a quote within 24 hours.",
  ],
};

// ──────────────────────────────────────────────
// Pattern matchers (each anchored, case-insensitive). Cover EN + romanized
// Hindi + romanized Kannada + common slang/abbreviations.
// ──────────────────────────────────────────────
const RE = {
  // Pure thanks (with optional emoji / multi-word)
  thanks: /^(thanks?|thnx|thx|ty|tysm|thank ?u|thank you( so much| very much)?|appreciated|appreciate it|dhanyavad|dhanyawaad|dhanyavaad|shukriya|shukriyaa|dhanyavadagalu)[\s\.!❤️💛😊🙏👍✨]*$/i,

  // Compliments
  compliment: /^(.{0,40})(amazing|awesome|wonderful|fantastic|excellent|brilliant|lovely|delicious|tasty|yummy|loved it|love your|best ever|best sweets|too good|superb|outstanding|sahi hai|mast|kamaal|laajawab|chennag|chennagide|bahut bad?h?iya|bahut achha|achi quality|good taste)([\s\.!❤️💛😊🙏✨]|$)/i,

  // Frustration / complaint
  frustration: /\b(angry|frustrated|bad experience|worst|terrible|horrible|disappointed|cheated|waste|waste of money|rubbish|pathetic|useless|complaint|complain|refund (please|now|pls)|i want my money|gussa|naraz|bekar|bekaar|ghatiya|raddi)\b/i,

  // Goodbye — also "bye bye", "good byee" etc.
  goodbye: /^(bye([\s\.\,]+bye)?|byee+|goodbye|good ?bye|good night|gn|gnight|tata|cya|see ya|see you|alvida|phir milte|phir milte hain|namaste(\s|$).{0,15}$|namaskara)[\s\.!👋❤️💛🙏]*$/i,

  // Acknowledgments (very short positive)
  ack: /^(ok|okay|okayy|kk|k|sure|cool|fine|got it|gotcha|understood|alright|all right|hm+|right|noted|samjha|samjh gaya|samjhi|theek|theek hai|thik hai|sahi|sahi hai|achha|achcha|achha thik|achcha theek|aha|ahaa|haan ji bilkul|bilkul)[\s\.!👍😊]*$/i,

  // Just "hmm" / thinking
  hmm: /^(hmm+|hmmm+|umm+|uhh+|aah+|oh)[\s\.]*$/i,

  // Yes — also "yes please", "haan bhai", "ji bilkul"
  yes: /^(yes|yeah|yep|yup|yess+|yesss+|haan|haan ji|hanji|han ji|han|ji haan|ji|of course|ofcourse|definitely|absolutely|sure|please do|kar do|krdo|kalisi|hudu|howdu)(\s+(please|pls|bhai|ji|bilkul|kar do|krdo))?[\s\.!👍]*$/i,

  // No
  no: /^(no|nope|nah|naah|not now|not really|nahi|nahin|nai|nahin chahiye|nako|illa|illri|illa illa|nopes)[\s\.]*$/i,

  // Confused / repeat
  confused_again: /^(again|repeat|samajh nahi( aaya)?|samajh nahin( aaya)?|samjha nahi( aaya)?|samjha nahin( aaya)?|nai samjha|kya|what\??|kuch samajh nahi aaya|ek baar aur|aur ek baar|once more|come again|sorry didn'?t (get|understand))(\s+(please|pls|bhai|ji))?[\s\.!?]*$/i,

  // Bulk / corporate / office intent
  bulk_intent: /\b(bulk|corporate|wholesale|office|company|wedding|return gift|return-gift|hampers?|many boxes|quantity|distributor|reseller|dealer)\b/i,

  // Vague "my order" / "track" without a number
  vague_order: /^(my order|order status|track ?my? ?order|where is my order|track|status|order kahaan hai|order kab milega)$/i,

  // Vague "product / price / catalog" — also "product price", "price list",
  // "menu please", "kitna price hai", etc.
  vague_product: /^(products?|prices?|rates?|cost|how much|kitna|kitne|kitni|catalog|catalogue|menu|list)(\s+(price[s]?|rate[s]?|info|details|list|please|pls|kitna|hai|chahiye|menu|catalog))*[\s\?\.!]*$/i,

  // Single character / punctuation
  vague_dot: /^[\.\,\;\:\!\#\@\$\%\^\&\*\(\)\-\_\=\+\|]{1,3}$/,
  vague_q:   /^\?+$/,
  vague_k:   /^k+$/i,

  // Greeting (broader than the original — covers Hindi/Kannada)
  greeting: /^(hi+|hello+|hey+|heya|hola|namaste|namaskar|namaskara|namaskaragalu|good (morning|afternoon|evening|day)|gm|ga|ge|gn|salaam|salam|halo)([\s\.!👋🙏❤️💛😊]|$)/i,
};

// ──────────────────────────────────────────────
// Main entry — returns true if handled.
// ──────────────────────────────────────────────
export async function tryConversationalReply(
  from: string,
  text: string,
): Promise<boolean> {
  const t = (text ?? "").trim();
  if (!t) return false;

  // Greeting → 3-button menu (kept as the user requested)
  if (RE.greeting.test(t)) {
    await sendWhatsAppButtons(
      from,
      `Hello! 👋 Welcome to *World of Mysore Pak*. How can I help you today?\n\n_(Type *human* anytime to talk to our team.)_`,
      [
        { id: "shop", title: "Show products" },
        { id: "track_order", title: "Track an order" },
        { id: "faq", title: "Common questions" },
      ],
    );
    await clearWaSession(from);
    return true;
  }

  if (RE.goodbye.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.goodbye));
    await clearWaSession(from);
    return true;
  }

  if (RE.frustration.test(t)) {
    // Don't shove buttons at someone who's upset — empathy first, then
    // ask for order number so a human can take over.
    await sendWhatsAppText(from, pick(REPLIES.frustration));
    await setWaSession(from, "await_order_number");
    return true;
  }

  if (RE.thanks.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.thanks));
    return true;
  }

  // "hmm" / "umm" — checked BEFORE ack because the ack regex catches
  // `hm+` and would otherwise steal these as a generic acknowledgment.
  if (RE.hmm.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.hmm));
    return true;
  }

  // Short acks like "sahi hai" / "theek hai" / "ok" should win over the
  // compliment matcher (which would also catch "sahi hai"). Same length
  // gate as below so longer compliments still fire correctly.
  if (t.length <= 25 && t.split(/\s+/).length <= 4 && RE.ack.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.ack));
    return true;
  }

  if (RE.compliment.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.compliment));
    return true;
  }

  if (RE.confused_again.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.confused_again));
    return true;
  }

  if (RE.bulk_intent.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.bulk_intent));
    return true;
  }

  if (RE.vague_order.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.vague_order));
    await setWaSession(from, "await_order_number");
    return true;
  }

  if (RE.vague_product.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.vague_product));
    await setWaSession(from, "await_product_name");
    return true;
  }

  if (RE.hmm.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.hmm));
    return true;
  }

  // (ack already checked above to win over compliment)

  if (RE.yes.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.yes));
    return true;
  }
  if (RE.no.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.no));
    return true;
  }

  if (RE.vague_dot.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.vague_dot));
    return true;
  }
  if (RE.vague_q.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.vague_q));
    return true;
  }
  if (RE.vague_k.test(t)) {
    await sendWhatsAppText(from, pick(REPLIES.ack));
    return true;
  }

  return false;
}
