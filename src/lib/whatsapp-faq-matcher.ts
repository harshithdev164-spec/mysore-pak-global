/**
 * Smarter FAQ matcher for the WhatsApp bot.
 *
 * Goes well beyond naive token-overlap:
 *  - Lowercase + strip punctuation
 *  - Lightweight English stemming ("shipping" → "ship", "delivered" → "deliver")
 *  - Synonym expansion ("courier" → "ship", "cost / much / rate" → "price",
 *    "veg / vegan / vegetarian" → "veg", etc.) so customers don't have to use
 *    the exact words from the FAQ
 *  - Bi-gram phrase signals ("how long", "how much", "can I cancel") add weight
 *  - Question-text matches count 3× more than answer-text matches
 *  - Category-implying words boost all FAQs in that category
 *  - Low confidence threshold + soft-reject so we surface a match instead
 *    of immediately handing off
 */

import { FAQ_ENTRIES, type FaqEntry } from "@/lib/chatbot-flows";

// ──────────────────────────────────────────────
// 1) Synonyms: many words → one canonical token.
// Keep keys lowercase. Order doesn't matter.
// ──────────────────────────────────────────────
const SYNONYMS: Record<string, string> = {
  // shipping / delivery
  ship: "ship", shipped: "ship", shipping: "ship", ships: "ship",
  deliver: "ship", delivers: "ship", delivered: "ship", delivery: "ship", deliveries: "ship",
  courier: "courier", couriered: "courier", couriers: "courier", // standalone — more specific
  dispatch: "ship", dispatched: "ship", despatch: "ship",
  send: "ship", sent: "ship", sending: "ship",
  arrive: "ship", arrival: "ship", arriving: "ship", arrives: "ship", arrived: "ship",
  reach: "ship", reaches: "ship",
  come: "ship", comes: "ship", coming: "ship", came: "ship",
  receive: "ship", received: "ship", receipt: "ship",
  awb: "track", tracking: "track", track: "track", tracked: "track", status: "track",

  // payment
  pay: "pay", paying: "pay", paid: "pay", payment: "pay", payments: "pay",
  upi: "pay", gpay: "pay", phonepe: "pay", paytm: "pay",
  card: "pay", cards: "pay", credit: "pay", debit: "pay", netbanking: "pay", wallet: "pay",
  razorpay: "pay",
  emi: "emi", installment: "emi", instalment: "emi", instalments: "emi",
  cod: "cod", "cash-on-delivery": "cod",
  refund: "refund", refunded: "refund", refunds: "refund", refunding: "refund",

  // time (note: "hours" is intentionally NOT here — it's mapped to the
  // contact "hours" token below since "working hours" is the dominant use)
  long: "time", duration: "time", soon: "time", days: "time", day: "time",
  fast: "time", quick: "time", quickly: "time", when: "time", time: "time",

  // price
  price: "price", prices: "price", priced: "price",
  cost: "price", costs: "price", costing: "price",
  rate: "price", rates: "price", charge: "price", charges: "price",
  fee: "price", fees: "price", much: "price", rupees: "price",
  expensive: "price", cheap: "price", affordable: "price", value: "price",

  // location / store
  located: "location", location: "location", address: "location",
  store: "location", shop: "location", outlet: "location", branch: "location",
  where: "location", visit: "location",
  pickup: "location", "pick-up": "location",

  // contact — split into more specific sub-tokens so e.g. whatsapp ≠ hours
  phone: "phone", number: "phone",
  whatsapp: "whatsapp", wa: "whatsapp", "whats-app": "whatsapp",
  email: "email", mail: "email", gmail: "email",
  contact: "contact", call: "contact", talk: "contact", speak: "contact",
  hours: "hours", timing: "hours", open: "hours", close: "hours", closed: "hours",
  monday: "hours", tuesday: "hours", wednesday: "hours", thursday: "hours",
  friday: "hours", saturday: "hours", sunday: "hours",

  // products / ingredients / dietary
  veg: "veg", vegetarian: "veg", "non-veg": "nonveg", nonveg: "nonveg",
  vegan: "vegan",
  gluten: "gluten", "gluten-free": "gluten",
  sugar: "sugar", sugarfree: "sugar", "sugar-free": "sugar", diabetic: "sugar", diabetes: "sugar",
  organic: "organic",
  ingredient: "ingredient", ingredients: "ingredient", contain: "ingredient", contains: "ingredient",
  allergen: "ingredient", allergens: "ingredient", allergy: "ingredient", allergies: "ingredient",
  nut: "nut", nuts: "nut", almond: "nut", almonds: "nut", cashew: "nut", cashews: "nut",
  ghee: "ghee", butter: "ghee", "cow-ghee": "ghee",
  jaggery: "jaggery", gud: "jaggery",
  fresh: "fresh", freshness: "fresh", expiry: "fresh", expire: "fresh", expires: "fresh",
  expired: "fresh", "best-before": "fresh", bb: "fresh", shelf: "fresh", "shelf-life": "fresh",
  date: "fresh", dates: "fresh",
  storage: "fresh", refrigerate: "fresh", refrigeration: "fresh",
  fssai: "fssai", certified: "fssai", certification: "fssai", licensed: "fssai",
  quality: "quality", hygiene: "quality", hygienic: "quality", pure: "quality",

  // ordering
  order: "order", orders: "order", ordered: "order", ordering: "order",
  buy: "order", bought: "order", buying: "order", purchase: "order", purchased: "order",
  cart: "order", checkout: "order", place: "order", placing: "order", placed: "order",
  cancel: "cancel", cancels: "cancel", cancelled: "cancel", cancellation: "cancel",
  modify: "modify", change: "modify", changes: "modify", changed: "modify",
  edit: "modify", update: "modify",
  damaged: "damaged", damage: "damaged", broken: "damaged", spoiled: "damaged", spoil: "damaged",
  missing: "missing", missed: "missing", lost: "missing",
  guest: "guest", account: "guest", login: "guest", "sign-in": "guest", signin: "guest",
  signup: "guest", register: "guest", registration: "guest",
  gift: "gift", gifts: "gift", gifting: "gift", present: "gift", wrap: "gift", wrapping: "gift",
  hamper: "gift", hampers: "gift", festival: "gift", diwali: "gift",
  bulk: "bulk", wholesale: "bulk", corporate: "bulk", quantity: "bulk", quantities: "bulk",

  // shipping geo
  international: "intl", abroad: "intl", overseas: "intl", outside: "intl", export: "intl",
  usa: "intl", uk: "intl", uae: "intl", canada: "intl", australia: "intl", singapore: "intl",
  pincode: "pincode", "pin-code": "pincode", postal: "pincode", postcode: "pincode", zip: "pincode",
  mumbai: "city", delhi: "city", bangalore: "city", bengaluru: "city", chennai: "city",
  hyderabad: "city", pune: "city", kolkata: "city",

  // intent: brand
  story: "brand", history: "brand", founded: "brand", started: "brand", since: "brand",
  about: "brand", who: "brand", whats: "brand", "what's": "brand",

  // ── Hindi/Kannada/slang/typo additions ──────────────────────────────
  // Customers in India mix English with regional words and abbreviations.
  // These map common forms to the canonical English token used by the FAQ.

  // Hindi (romanized)
  kab: "time", kabtak: "time", "kab-tak": "time", jaldi: "time",
  kitna: "price", kitne: "price", kitni: "price",
  paisa: "price", paise: "price", paisey: "price",
  milega: "ship", milegi: "ship", milenge: "ship",
  bhej: "ship", bhejo: "ship", bhejna: "ship",
  karna: "order", krna: "order", krdo: "order",
  chahiye: "order", chaahiye: "order", mangwana: "order", mangao: "order",
  wapas: "refund", wapis: "refund", wapsi: "refund",
  galat: "damaged", kharab: "damaged", toot: "damaged", tutaa: "damaged",
  patachalna: "track",
  asli: "quality", original: "quality", sahi: "quality",
  meetha: "veg", meethai: "veg", mithai: "veg", mithaai: "veg",

  // Kannada (romanized)
  yelli: "location", yelliddira: "location",
  eshtu: "price", eshtke: "price",
  yavaga: "time", yawaaga: "time",
  hege: "order",
  bandide: "track", bandiyaa: "track",
  kalisi: "ship", kalisli: "ship", kalisbeku: "ship",
  beku: "order", bekagide: "order", madbeku: "order",

  // Slang / abbreviations
  thnx: "thanks", thx: "thanks",
  asap: "time",
  qr: "pay", scan: "pay",
  free: "free", complimentary: "free", freebie: "free",
  discount: "discount", coupon: "discount", offer: "discount",
  promo: "discount", deal: "discount", offers: "discount", deals: "discount",
  gst: "gst", invoice: "gst", bill: "gst", "b2b": "gst",

  // Common typos
  deliveri: "ship", deliveery: "ship", shippin: "ship",
  paymet: "pay", payement: "pay", paymnt: "pay",
  ordr: "order", oder: "order",
  msore: "mysore", mysor: "mysore", mysoore: "mysore",
  kaaju: "nut",
  anjir: "anjeer", figs: "anjeer",
};

// ──────────────────────────────────────────────
// 2) Stopwords: drop entirely (too common to score).
// ──────────────────────────────────────────────
const STOPWORDS = new Set([
  "the","a","an","is","are","am","do","does","did","done","i","me","my","mine",
  "you","your","yours","we","us","our","ours","they","them","their",
  "to","for","of","and","or","in","on","at","with","without","by","as",
  "from","into","onto","over","under","up","down","off",
  "can","could","would","should","may","might","will","shall","must","need",
  "what","how","when","where","why","which","who","whom",
  "please","pls","plz","kindly","thanks","thank","ty","ok","okay",
  "hi","hello","hey","sir","madam","ma'am",
  "this","that","these","those","it","its","there",
  "not","no","yes","yeah","yep","nope",
  "be","been","being","have","has","had","get","got","go","goes","gone",
  "any","some","all","none","one","two","first",
  "very","really","just","also","still","even","only","too","quite","pretty",
  "if","then","than","because","cause","since",
  "now","today","tomorrow","later","soon","next","last",
  "want","need","like","love",
]);

// ──────────────────────────────────────────────
// 3) Stemmer — strip a few common English suffixes.
// Tiny on purpose; aggressive stemming over-collapses.
// ──────────────────────────────────────────────
function stem(word: string): string {
  if (word.length <= 3) return word;
  const suffixes = ["ingly","edly","fully","ness","ment","tion","sion","ies","ied","ing","ed","es","s","ly","er","est"];
  for (const suf of suffixes) {
    if (word.length > suf.length + 2 && word.endsWith(suf)) {
      return word.slice(0, -suf.length);
    }
  }
  return word;
}

// Normalize one token: synonyms FIRST (a word like "when" is both a stopword
// AND a synonym for "time" — we want the synonym to win), then stopword,
// then stem-then-synonym.
function normalizeToken(raw: string): string | null {
  const w = raw.toLowerCase();
  if (SYNONYMS[w]) return SYNONYMS[w];
  if (STOPWORDS.has(w)) return null;
  if (w.length < 3) return null;
  const stemmed = stem(w);
  return SYNONYMS[stemmed] ?? stemmed;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, " ")
    .split(/\s+/)
    .map(normalizeToken)
    .filter((t): t is string => t !== null);
}

// ──────────────────────────────────────────────
// 4) Bi-gram phrase signals — boost when the user
// uses a specific question phrase.
// ──────────────────────────────────────────────
const PHRASES: { phrase: string; tokens: string[]; boost: number }[] = [
  { phrase: "how long",     tokens: ["time","ship"],    boost: 4 },
  { phrase: "how much",     tokens: ["price"],          boost: 4 },
  { phrase: "where is",     tokens: ["location","track"], boost: 3 },
  { phrase: "where are",    tokens: ["location"],       boost: 3 },
  { phrase: "do you ship",  tokens: ["ship"],           boost: 4 },
  { phrase: "do you have",  tokens: ["order"],          boost: 2 },
  { phrase: "i want to",    tokens: ["order"],          boost: 2 },
  { phrase: "can i",        tokens: [],                 boost: 1 },
  { phrase: "what is",      tokens: [],                 boost: 1 },
  { phrase: "shelf life",   tokens: ["fresh"],          boost: 4 },
  { phrase: "made in",      tokens: ["brand","location"], boost: 3 },
  { phrase: "how do i",     tokens: ["order"],          boost: 2 },
  { phrase: "talk to",      tokens: ["contact"],        boost: 3 },
];

function phraseBoosts(rawText: string): string[] {
  const t = " " + rawText.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ") + " ";
  const out: string[] = [];
  for (const { phrase, tokens, boost } of PHRASES) {
    if (t.includes(" " + phrase + " ")) {
      for (let i = 0; i < boost; i++) out.push(...tokens);
    }
  }
  return out;
}

// ──────────────────────────────────────────────
// 5) Pre-index FAQ entries (run once at module load).
// Each entry gets a normalized question-token set + answer-token set
// + a category-token for category boosting.
// ──────────────────────────────────────────────
interface IndexedFaq {
  entry: FaqEntry;
  questionTokens: Set<string>;
  answerTokens: Set<string>;
  categoryToken: string;
}

const INDEX: IndexedFaq[] = FAQ_ENTRIES.map((entry) => ({
  entry,
  questionTokens: new Set(tokenize(entry.question)),
  answerTokens: new Set(tokenize(entry.answer)),
  categoryToken: entry.category.toLowerCase(),
}));

// IDF-lite: rare tokens (only in 1-2 questions) are highly discriminative;
// common tokens (in 8+) are barely useful. Used to weight question matches.
const QUESTION_DF = new Map<string, number>();
for (const idx of INDEX) {
  idx.questionTokens.forEach((t) => {
    QUESTION_DF.set(t, (QUESTION_DF.get(t) ?? 0) + 1);
  });
}
function idfWeight(token: string): number {
  const df = QUESTION_DF.get(token) ?? 1;
  if (df <= 2) return 1.6;   // rare = highly informative (e.g. "fssai", "emi")
  if (df <= 5) return 1.0;   // medium
  if (df <= 10) return 0.7;  // common
  return 0.4;                // very common (e.g. "ship", "order")
}

// Category-implying tokens — when present in the query, boost matching FAQs.
const CATEGORY_HINTS: Record<string, string[]> = {
  shipping: ["ship","courier","track","time","intl","pincode","city","cod"],
  payment: ["pay","emi","refund","cod"],
  returns: ["refund","cancel","damaged","missing","modify"],
  products: ["veg","vegan","gluten","sugar","organic","ingredient","nut","ghee","jaggery","fresh"],
  ordering: ["order","modify","cancel","guest"],
  gifting: ["gift","bulk"],
  brand: ["brand","location","fssai","quality"],
  contact: ["contact","phone","whatsapp","email","hours","location"],
  quality: ["quality","fresh","ghee","fssai"],
  discounts: ["discount","free"],
  invoicing: ["gst","tax"],
};

// ──────────────────────────────────────────────
// 6) Match function — returns the best entry + confidence.
// ──────────────────────────────────────────────
export interface FaqMatchResult {
  entry: FaqEntry;
  score: number;     // raw score
  confidence: number; // 0..1 normalized
}

export function matchFaqSmart(rawText: string): FaqMatchResult | null {
  // Dedupe query tokens so "fssai certified" (both → fssai) doesn't double-count.
  const queryTokens = new Set(tokenize(rawText));
  // Phrase boosts ARE allowed to repeat — they're separately tuned.
  const phraseHints = phraseBoosts(rawText);

  if (queryTokens.size === 0 && phraseHints.length === 0) return null;

  // Which categories does this query hint at?
  const queryCategories = new Set<string>();
  const allHintTokens = Array.from(queryTokens).concat(phraseHints);
  for (const t of allHintTokens) {
    for (const [cat, hints] of Object.entries(CATEGORY_HINTS)) {
      if (hints.includes(t)) queryCategories.add(cat);
    }
  }

  let best: IndexedFaq | null = null;
  let bestScore = 0;

  for (const idx of INDEX) {
    let score = 0;
    let matchedQuestionTokens = 0;

    // Question matches — strongest signal, weighted by IDF
    queryTokens.forEach((t) => {
      if (idx.questionTokens.has(t)) {
        score += 5 * idfWeight(t);
        matchedQuestionTokens++;
      } else if (idx.answerTokens.has(t)) {
        score += 1 * idfWeight(t);
      }
    });
    // Phrase boosts — count each occurrence
    for (const t of phraseHints) {
      if (idx.questionTokens.has(t)) score += 1.5;
    }
    // Category boost — modest
    if (queryCategories.has(idx.categoryToken)) score += 1.5;

    // Specificity bonus: when the query is short and the matched FAQ's
    // question is also short, that's a focused topical hit.
    if (queryTokens.size <= 3 && idx.questionTokens.size <= 3) score += 1;

    // Coverage bonus: when the matched FAQ's question is mostly covered by
    // the query, that's the "primary topic" of this FAQ. Prefers
    // "gift wrapping?" → "Do you offer gift wrapping?" (full coverage)
    // over "Do you do bulk or corporate gifting?" (partial coverage).
    if (matchedQuestionTokens > 0 && idx.questionTokens.size > 0) {
      const coverage = matchedQuestionTokens / idx.questionTokens.size;
      score += coverage * 2;
    }

    if (score > bestScore) {
      best = idx;
      bestScore = score;
    }
  }

  if (!best || bestScore < 4) return null;

  const confidence = Math.min(1, bestScore / 25);
  return { entry: best.entry, score: bestScore, confidence };
}
