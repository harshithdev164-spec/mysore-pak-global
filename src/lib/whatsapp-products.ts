/**
 * Fuzzy product matcher for the WhatsApp bot.
 *
 * Customers send things like:
 *   "I want kaju mysore pak"
 *   "send me 500g chocolate bites"
 *   "do you have besan ladoo?"   (we don't — match returns null)
 *   "order chakkuli"
 *
 * We score each active product by word-overlap against the user's message,
 * return the top match (or top N) with weight extracted from the message if
 * present. The reply links to /products/<slug> on the website where the
 * customer picks the weight and checks out.
 */

import { createAdminClient } from "@/lib/supabase";

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  weights: { label: string; price: number }[];
}

// In-memory cache. Refresh every 10 min — products don't change often.
let CACHE: { at: number; rows: ProductRow[] } | null = null;
const TTL_MS = 10 * 60 * 1000;

export async function getActiveProducts(): Promise<ProductRow[]> {
  if (CACHE && Date.now() - CACHE.at < TTL_MS) return CACHE.rows;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, weights:product_weights(label, price)")
      .eq("is_active", true);
    const rows = (data ?? []) as ProductRow[];
    CACHE = { at: Date.now(), rows };
    return rows;
  } catch (err) {
    console.error("[whatsapp-products] fetch failed:", err);
    return CACHE?.rows ?? [];
  }
}

// Words that customers use but that don't help disambiguate a product.
const STOPWORDS = new Set([
  "i","me","my","you","your","we","us","the","a","an","is","are","do","does",
  "to","for","of","and","or","in","on","at","with","can","could","please","pls",
  "want","need","get","give","buy","order","purchase","send","ship","deliver",
  "have","like","love","try","tasting","know","information","details","info",
  "kg","kgs","gm","gms","g","grams","gram","weight","pack","packet","box","boxes",
  "rs","rupees","price","cost","much","how",
  "online","website","store","shop",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

// Tiny Levenshtein for typo-tolerance ("msore" → "mysore", "kaaju" → "kaju").
// Capped at maxDist for early exit.
function levenshtein(a: string, b: string, maxDist = 2): number {
  if (Math.abs(a.length - b.length) > maxDist) return maxDist + 1;
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > maxDist) return maxDist + 1; // early exit
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

// Fuzzy match: are two short tokens "close enough"? More tolerant for
// longer words. "msore" ≈ "mysore", "anjir" ≈ "anjeer", "muruku" ≈ "muruk".
function fuzzyEq(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false; // avoid tiny-word collisions
  const maxLen = Math.max(a.length, b.length);
  const allowed = maxLen >= 8 ? 2 : 1;
  return levenshtein(a, b, allowed) <= allowed;
}

// Extract a weight like "500g", "1 kg", "250 gm" → normalized label.
export function extractWeight(text: string): string | null {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  // grams: 100g, 250 g, 500gm, 200 grams
  const g = t.match(/(\d{2,4})\s*(?:g|gm|gms|grams?)\b/);
  if (g) {
    const n = parseInt(g[1], 10);
    if (n >= 50 && n <= 5000) return `${n}g`;
  }
  // kg: 1kg, 1 kg, 2kgs
  const kg = t.match(/(\d)(?:\s*\.\s*(\d))?\s*(?:kg|kgs)\b/);
  if (kg) {
    const whole = kg[1];
    const frac = kg[2];
    if (frac) return `${whole}.${frac}kg`;
    return `${whole}kg`;
  }
  return null;
}

export interface ProductMatch {
  product: ProductRow;
  score: number;
  matched_tokens: string[];
}

// Score products by overlapping tokens. Higher = better.
export async function matchProducts(text: string, max = 3): Promise<ProductMatch[]> {
  const tokens = tokenize(text);
  if (tokens.length === 0) return [];
  const products = await getActiveProducts();

  const scored: ProductMatch[] = [];
  for (const p of products) {
    const nameTokens = tokenize(p.name);
    if (nameTokens.length === 0) continue;
    let score = 0;
    const matched: string[] = [];
    for (const t of tokens) {
      if (nameTokens.includes(t)) {
        // Exact name-token match — strongest signal
        score += 3;
        matched.push(t);
      } else if (nameTokens.some((n) => fuzzyEq(n, t))) {
        // Typo / near-match — "msore" ≈ "mysore", "anjir" ≈ "anjeer"
        score += 2;
        matched.push(t);
      } else if (nameTokens.some((n) => n.includes(t) || t.includes(n))) {
        // Partial substring fallback
        score += 1;
        matched.push(t);
      }
    }
    if (score > 0) scored.push({ product: p, score, matched_tokens: matched });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max);
}

// Intent detection: does this message look like an order request?
// We're conservative — only fire when there's a clear "I want / send / buy / order" verb
// AND at least one non-stopword token (so we don't trigger on a bare "I want it").
const ORDER_VERBS = /\b(buy|order|purchase|send|ship|deliver|want|need|get|give me|interested in|looking for|do you have|can i get|how much|price|cost)\b/i;

export function looksLikeOrderIntent(text: string): boolean {
  if (!ORDER_VERBS.test(text)) return false;
  return tokenize(text).length > 0;
}
