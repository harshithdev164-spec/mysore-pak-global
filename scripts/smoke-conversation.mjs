// Smoke test for the conversational micro-intent detector.
// Mirrors src/lib/whatsapp-conversation.ts regex set.
// Run: node scripts/smoke-conversation.mjs

const RE = {
  thanks: /^(thanks?|thnx|thx|ty|tysm|thank ?u|thank you( so much| very much)?|appreciated|appreciate it|dhanyavad|dhanyawaad|dhanyavaad|shukriya|shukriyaa|dhanyavadagalu)[\s\.!❤️💛😊🙏👍✨]*$/i,
  compliment: /^(.{0,40})(amazing|awesome|wonderful|fantastic|excellent|brilliant|lovely|delicious|tasty|yummy|loved it|love your|best ever|best sweets|too good|superb|outstanding|sahi hai|mast|kamaal|laajawab|chennag|chennagide|bahut bad?h?iya|bahut achha|achi quality|good taste)([\s\.!❤️💛😊🙏✨]|$)/i,
  frustration: /\b(angry|frustrated|bad experience|worst|terrible|horrible|disappointed|cheated|waste|waste of money|rubbish|pathetic|useless|complaint|complain|refund (please|now|pls)|i want my money|gussa|naraz|bekar|bekaar|ghatiya|raddi)\b/i,
  goodbye: /^(bye([\s\.\,]+bye)?|byee+|goodbye|good ?bye|good night|gn|gnight|tata|cya|see ya|see you|alvida|phir milte|phir milte hain|namaste(\s|$).{0,15}$|namaskara)[\s\.!👋❤️💛🙏]*$/i,
  ack: /^(ok|okay|okayy|kk|k|sure|cool|fine|got it|gotcha|understood|alright|all right|hm+|right|noted|samjha|samjh gaya|samjhi|theek|theek hai|thik hai|sahi|sahi hai|achha|achcha|achha thik|achcha theek|aha|ahaa|haan ji bilkul|bilkul)[\s\.!👍😊]*$/i,
  hmm: /^(hmm+|hmmm+|umm+|uhh+|aah+|oh)[\s\.]*$/i,
  yes: /^(yes|yeah|yep|yup|yess+|yesss+|haan|haan ji|hanji|han ji|han|ji haan|ji|of course|ofcourse|definitely|absolutely|sure|please do|kar do|krdo|kalisi|hudu|howdu)(\s+(please|pls|bhai|ji|bilkul|kar do|krdo))?[\s\.!👍]*$/i,
  no: /^(no|nope|nah|naah|not now|not really|nahi|nahin|nai|nahin chahiye|nako|illa|illri|illa illa|nopes)[\s\.]*$/i,
  confused_again: /^(again|repeat|samajh nahi( aaya)?|samajh nahin( aaya)?|samjha nahi( aaya)?|samjha nahin( aaya)?|nai samjha|kya|what\??|kuch samajh nahi aaya|ek baar aur|aur ek baar|once more|come again|sorry didn'?t (get|understand))(\s+(please|pls|bhai|ji))?[\s\.!?]*$/i,
  bulk_intent: /\b(bulk|corporate|wholesale|office|company|wedding|return gift|return-gift|hampers?|many boxes|quantity|distributor|reseller|dealer)\b/i,
  vague_order: /^(my order|order status|track ?my? ?order|where is my order|track|status|order kahaan hai|order kab milega)$/i,
  vague_product: /^(products?|prices?|rates?|cost|how much|kitna|kitne|kitni|catalog|catalogue|menu|list)(\s+(price[s]?|rate[s]?|info|details|list|please|pls|kitna|hai|chahiye|menu|catalog))*[\s\?\.!]*$/i,
  vague_dot: /^[\.\,\;\:\!\#\@\$\%\^\&\*\(\)\-\_\=\+\|]{1,3}$/,
  vague_q: /^\?+$/,
  vague_k: /^k+$/i,
  greeting: /^(hi+|hello+|hey+|heya|hola|namaste|namaskar|namaskara|namaskaragalu|good (morning|afternoon|evening|day)|gm|ga|ge|gn|salaam|salam|halo)([\s\.!👋🙏❤️💛😊]|$)/i,
};

function detect(t) {
  t = (t ?? "").trim();
  if (!t) return "(empty)";
  if (RE.greeting.test(t)) return "greeting";
  if (RE.goodbye.test(t)) return "goodbye";
  if (RE.frustration.test(t)) return "frustration";
  if (RE.thanks.test(t)) return "thanks";
  // hmm BEFORE ack — ack regex catches `hm+`
  if (RE.hmm.test(t)) return "hmm";
  // ack short-form (e.g. "sahi hai", "theek hai") takes priority over compliment
  if (t.length <= 25 && t.split(/\s+/).length <= 4 && RE.ack.test(t)) return "ack";
  if (RE.compliment.test(t)) return "compliment";
  if (RE.confused_again.test(t)) return "confused_again";
  if (RE.bulk_intent.test(t)) return "bulk_intent";
  if (RE.vague_order.test(t)) return "vague_order";
  if (RE.vague_product.test(t)) return "vague_product";
  if (RE.yes.test(t)) return "yes";
  if (RE.no.test(t)) return "no";
  if (RE.vague_dot.test(t)) return "vague_dot";
  if (RE.vague_q.test(t)) return "vague_q";
  if (RE.vague_k.test(t)) return "vague_k";
  return "→ fall through to FAQ/product matcher";
}

const cases = [
  // ── 13 spec examples ──
  ["hi", "greeting"],
  ["thanks", "thanks"],
  ["ok", "ack"],
  ["hmm", "hmm"],
  ["again", "confused_again"],
  ["my order", "vague_order"],
  ["product price", "vague_product"],
  ["i want sweets for office", "bulk_intent"],
  ["your sweets are amazing", "compliment"],
  [".", "vague_dot"],
  ["?", "vague_q"],
  ["no", "no"],
  ["bye", "goodbye"],

  // ── Variations the bot should handle ──
  ["Hi 👋", "greeting"],
  ["hello there", "greeting"],
  ["namaste", "greeting"],
  ["good morning", "greeting"],
  ["thank you so much!", "thanks"],
  ["thnx 🙏", "thanks"],
  ["dhanyavad", "thanks"],
  ["shukriya", "thanks"],
  ["loved it", "compliment"],
  ["best sweets ever", "compliment"],
  ["bahut achha", "compliment"],
  ["mast", "compliment"],
  ["chennagide", "compliment"],
  ["this is terrible", "frustration"],
  ["worst experience", "frustration"],
  ["i want my money back", "frustration"],
  ["bekar", "frustration"],
  ["good night", "goodbye"],
  ["alvida", "goodbye"],
  ["bye bye", "goodbye"],
  ["cya", "goodbye"],
  ["okay", "ack"],
  ["kk", "ack"],
  ["sure", "ack"],
  ["theek hai", "ack"],
  ["sahi hai", "ack"], // catches both ack/compliment — ack should win by order
  ["got it", "ack"],
  ["hmmm", "hmm"],
  ["umm", "hmm"],
  ["yes please", "yes"],
  ["haan ji", "yes"],
  ["hanji", "yes"],
  ["nahi", "no"],
  ["nope", "no"],
  ["not now", "no"],
  ["repeat please", "confused_again"],
  ["samajh nahi aaya", "confused_again"],
  ["what?", "confused_again"],
  ["wedding gift hampers", "bulk_intent"],
  ["bulk order pls", "bulk_intent"],
  ["wholesale rates", "bulk_intent"],
  ["price", "vague_product"],
  ["catalog", "vague_product"],
  ["products please", "vague_product"],
  ["how much", "vague_product"],
  ["kitna", "vague_product"],
  ["track", "vague_order"],
  ["where is my order", "vague_order"],
  ["..", "vague_dot"],
  ["???", "vague_q"],
  ["kkk", "vague_k"],

  // ── Should FALL THROUGH (real questions, not micro-intents) ──
  ["how long does delivery take", "fall through"],
  ["I want kaju mysore pak", "fall through"],
  ["0363", "fall through"],
  ["do you ship to mumbai", "fall through"],
];

let ok = 0;
console.log("INPUT".padEnd(40) + "EXPECTED".padEnd(20) + "GOT");
console.log("─".repeat(110));
for (const [input, expected] of cases) {
  const got = detect(input);
  const pass = expected === "fall through"
    ? got.startsWith("→")
    : got === expected;
  if (pass) ok++;
  console.log(
    `${pass ? "✓" : "✗"} ${input.slice(0, 36).padEnd(38)}${expected.padEnd(20)}${got}`
  );
}
console.log("─".repeat(110));
console.log(`${ok} / ${cases.length} passed`);
