/**
 * GST + finance calculation engine for World of Mysore Pak.
 *
 * Rule (per spec):
 *   - Karnataka destinations  → CGST 9% + SGST 9%  (total GST 18%)
 *   - All other Indian states → IGST 18%
 *   - International orders    → no GST (export, zero-rated)
 *
 * Prices on the storefront are GST-INCLUSIVE (consumer-facing convention
 * for D2C in India). So to get the GST broken out of a paid-amount we
 * reverse-calculate: taxable = total / 1.18, gst = total − taxable.
 *
 * The GST rate is configurable via FINANCE_GST_RATE_PCT (default 18) in
 * case the business is later assessed under a different HSN tax slab.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OrderRow = any;

const KARNATAKA_TAGS = new Set([
  "karnataka", "ka", "karnataka state", "blr", "bangalore", "mysuru", "mysore",
]);

// Canonicalize the dozen-or-so spellings of each Indian state customers
// type at checkout so the state report shows one row per actual state.
const STATE_ALIASES: Record<string, string> = {
  "tamil nadu": "Tamil Nadu", "tamilnadu": "Tamil Nadu", "tn": "Tamil Nadu",
  "maharashtra": "Maharashtra", "mh": "Maharashtra",
  "karnataka": "Karnataka", "ka": "Karnataka",
  "andhra pradesh": "Andhra Pradesh", "ap": "Andhra Pradesh", "andhrapradesh": "Andhra Pradesh",
  "telangana": "Telangana", "ts": "Telangana", "tg": "Telangana",
  "uttar pradesh": "Uttar Pradesh", "up": "Uttar Pradesh", "uttarpradesh": "Uttar Pradesh",
  "uttarakhand": "Uttarakhand", "uk": "Uttarakhand",
  "kerala": "Kerala", "kl": "Kerala",
  "delhi": "Delhi", "new delhi": "Delhi", "dl": "Delhi",
  "west bengal": "West Bengal", "westbengal": "West Bengal", "wb": "West Bengal",
  "gujarat": "Gujarat", "gj": "Gujarat",
  "rajasthan": "Rajasthan", "rj": "Rajasthan",
  "punjab": "Punjab", "pb": "Punjab",
  "haryana": "Haryana", "hr": "Haryana",
  "madhya pradesh": "Madhya Pradesh", "mp": "Madhya Pradesh", "madhyapradesh": "Madhya Pradesh",
  "bihar": "Bihar", "br": "Bihar",
  "odisha": "Odisha", "orissa": "Odisha", "od": "Odisha",
  "assam": "Assam", "as": "Assam",
  "jharkhand": "Jharkhand", "jh": "Jharkhand",
  "chhattisgarh": "Chhattisgarh", "cg": "Chhattisgarh",
  "himachal pradesh": "Himachal Pradesh", "hp": "Himachal Pradesh",
  "goa": "Goa", "ga": "Goa",
  "jammu and kashmir": "Jammu & Kashmir", "jammu & kashmir": "Jammu & Kashmir", "jk": "Jammu & Kashmir",
  "puducherry": "Puducherry", "pondicherry": "Puducherry", "py": "Puducherry",
  "chandigarh": "Chandigarh", "ch": "Chandigarh",
  "tripura": "Tripura", "tr": "Tripura",
  "manipur": "Manipur", "mn": "Manipur",
  "meghalaya": "Meghalaya", "ml": "Meghalaya",
  "nagaland": "Nagaland", "nl": "Nagaland",
  "mizoram": "Mizoram", "mz": "Mizoram",
  "sikkim": "Sikkim", "sk": "Sikkim",
  "arunachal pradesh": "Arunachal Pradesh", "ar": "Arunachal Pradesh",
  "andaman and nicobar islands": "Andaman & Nicobar Islands", "an": "Andaman & Nicobar Islands",
  "ladakh": "Ladakh", "la": "Ladakh",
  "lakshadweep": "Lakshadweep", "ld": "Lakshadweep",
  "dadra and nagar haveli": "Dadra & Nagar Haveli", "dn": "Dadra & Nagar Haveli",
};

function canonicalState(raw: string): string {
  const k = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return STATE_ALIASES[k] ?? (raw.trim() || "Unknown");
}

export const GST_RATE_PCT = Number.isFinite(Number(process.env.FINANCE_GST_RATE_PCT))
  ? Number(process.env.FINANCE_GST_RATE_PCT)
  : 18;

export const GST_RATE = GST_RATE_PCT / 100;

export type GstBucket = "cgst_sgst" | "igst" | "export";

// Look up the destination state from the order. The `shipping_address` JSONB
// has `state` and `country`; if either is missing we fall back to the legacy
// `shipping_country` denormalized column.
export function destinationBucket(order: OrderRow): GstBucket {
  const addr = (order?.shipping_address ?? {}) as { state?: string; country?: string };
  const country = (addr.country ?? order?.shipping_country ?? "IN").toString().toUpperCase();
  if (country !== "IN") return "export";
  const state = (addr.state ?? "").toString().trim().toLowerCase();
  return KARNATAKA_TAGS.has(state) ? "cgst_sgst" : "igst";
}

export interface GstSplit {
  taxable: number;       // value before GST
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  gross: number;         // taxable + total_gst, equals the amount we use
}

// Compute GST split for a single order. Returns zeroes on export orders.
// We compute GST on (subtotal − discount), NOT shipping_cost. Shipping is
// not GST-applicable here (sweets HSN; shipping is bundled at zero margin).
export function gstSplitForOrder(order: OrderRow): GstSplit {
  const subtotal = Number(order?.subtotal ?? 0);
  const discount = Number(order?.discount ?? 0);
  const taxableInclusive = Math.max(0, subtotal - discount);
  const bucket = destinationBucket(order);
  if (bucket === "export") {
    return { taxable: taxableInclusive, cgst: 0, sgst: 0, igst: 0, total_gst: 0, gross: taxableInclusive };
  }
  // Reverse-calc since prices are GST-inclusive
  const taxable = round2(taxableInclusive / (1 + GST_RATE));
  const totalGst = round2(taxableInclusive - taxable);
  if (bucket === "cgst_sgst") {
    const half = round2(totalGst / 2);
    return {
      taxable, cgst: half, sgst: round2(totalGst - half), igst: 0,
      total_gst: totalGst, gross: taxableInclusive,
    };
  }
  return { taxable, cgst: 0, sgst: 0, igst: totalGst, total_gst: totalGst, gross: taxableInclusive };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function inr(n: number): string {
  const v = Number(n) || 0;
  return v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

// ──────────────────────────────────────────────
// Aggregations
// ──────────────────────────────────────────────

export interface KpiBundle {
  total_orders: number;
  total_revenue: number;
  total_subtotal: number;       // sum of subtotals (used for taxable base)
  total_discount: number;
  total_shipping: number;
  total_gst: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  refunded_amount: number;
  refunded_orders: number;
  net_revenue: number;          // gross − refunds
  avg_order_value: number;
}

export function buildKpis(orders: OrderRow[]): KpiBundle {
  let revenue = 0, sub = 0, disc = 0, ship = 0;
  let cgst = 0, sgst = 0, igst = 0;
  let refundAmt = 0, refundOrders = 0;
  for (const o of orders) {
    const total = Number(o.total ?? 0);
    revenue += total;
    sub += Number(o.subtotal ?? 0);
    disc += Number(o.discount ?? 0);
    ship += Number(o.shipping_cost ?? 0);
    if (o.payment_status === "refunded") {
      refundAmt += total;
      refundOrders += 1;
      continue; // refunded orders don't contribute GST
    }
    const split = gstSplitForOrder(o);
    cgst += split.cgst;
    sgst += split.sgst;
    igst += split.igst;
  }
  const totalGst = round2(cgst + sgst + igst);
  return {
    total_orders: orders.length,
    total_revenue: round2(revenue),
    total_subtotal: round2(sub),
    total_discount: round2(disc),
    total_shipping: round2(ship),
    total_gst: totalGst,
    total_cgst: round2(cgst),
    total_sgst: round2(sgst),
    total_igst: round2(igst),
    refunded_amount: round2(refundAmt),
    refunded_orders: refundOrders,
    net_revenue: round2(revenue - refundAmt),
    avg_order_value: orders.length > 0 ? round2(revenue / orders.length) : 0,
  };
}

export interface GstRow {
  tax_type: "CGST" | "SGST" | "IGST" | "Total GST";
  taxable_value: number;
  gst_amount: number;
}

export function buildGstSummary(orders: OrderRow[]): GstRow[] {
  let cgstTax = 0, cgstAmt = 0;
  let sgstTax = 0, sgstAmt = 0;
  let igstTax = 0, igstAmt = 0;
  for (const o of orders) {
    if (o.payment_status === "refunded") continue;
    const split = gstSplitForOrder(o);
    if (split.cgst > 0) { cgstTax += split.taxable; cgstAmt += split.cgst; }
    if (split.sgst > 0) { sgstTax += split.taxable; sgstAmt += split.sgst; }
    if (split.igst > 0) { igstTax += split.taxable; igstAmt += split.igst; }
  }
  const totalTax = round2(cgstTax + igstTax); // CGST taxable equals SGST taxable, don't double-count
  const totalAmt = round2(cgstAmt + sgstAmt + igstAmt);
  return [
    { tax_type: "CGST", taxable_value: round2(cgstTax), gst_amount: round2(cgstAmt) },
    { tax_type: "SGST", taxable_value: round2(sgstTax), gst_amount: round2(sgstAmt) },
    { tax_type: "IGST", taxable_value: round2(igstTax), gst_amount: round2(igstAmt) },
    { tax_type: "Total GST", taxable_value: totalTax, gst_amount: totalAmt },
  ];
}

export interface StateRow {
  state: string;
  orders: number;
  revenue: number;
  gst: number;
}

export function buildStateReport(orders: OrderRow[]): StateRow[] {
  const map = new Map<string, StateRow>();
  for (const o of orders) {
    if (o.payment_status === "refunded") continue;
    const addr = (o.shipping_address ?? {}) as { state?: string; country?: string };
    const country = (addr.country ?? o.shipping_country ?? "IN").toString().toUpperCase();
    const stateLabel = country === "IN"
      ? canonicalState(addr.state ?? "Unknown")
      : `Export · ${country}`;
    const key = stateLabel.trim() || "Unknown";
    const split = gstSplitForOrder(o);
    const row = map.get(key) ?? { state: key, orders: 0, revenue: 0, gst: 0 };
    row.orders += 1;
    row.revenue += Number(o.total ?? 0);
    row.gst += split.total_gst;
    map.set(key, row);
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, revenue: round2(r.revenue), gst: round2(r.gst) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface ProductRow {
  product: string;
  qty: number;
  revenue: number;
}

// Aggregate items from the `items` join. Each `o.items` is an array of
// {product_name, quantity, total_price}.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildProductReport(orders: any[]): ProductRow[] {
  const map = new Map<string, ProductRow>();
  for (const o of orders) {
    if (o.payment_status === "refunded") continue;
    const items = (o.items ?? []) as { product_name: string; quantity: number; total_price: number }[];
    for (const it of items) {
      const k = (it.product_name ?? "Unknown").trim();
      const row = map.get(k) ?? { product: k, qty: 0, revenue: 0 };
      row.qty += Number(it.quantity ?? 0);
      row.revenue += Number(it.total_price ?? 0);
      map.set(k, row);
    }
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, revenue: round2(r.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface PaymentRow {
  method: string;
  orders: number;
  revenue: number;
}

// Map raw payment_method values to display-friendly labels.
const METHOD_LABELS: Record<string, string> = {
  razorpay: "Razorpay (UPI/Cards/NetBanking)",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
  wallet: "Wallet",
};

export function buildPaymentReport(orders: OrderRow[]): PaymentRow[] {
  const map = new Map<string, PaymentRow>();
  for (const o of orders) {
    const raw = (o.payment_method ?? "unknown").toString().toLowerCase();
    const label = METHOD_LABELS[raw] ?? raw.replace(/\b\w/g, (c: string) => c.toUpperCase());
    const row = map.get(label) ?? { method: label, orders: 0, revenue: 0 };
    row.orders += 1;
    row.revenue += Number(o.total ?? 0);
    map.set(label, row);
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, revenue: round2(r.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface DailyRow {
  date: string;     // YYYY-MM-DD (IST day)
  orders: number;
  revenue: number;
  gst: number;
}

export function buildDailyTrend(orders: OrderRow[]): DailyRow[] {
  const map = new Map<string, DailyRow>();
  for (const o of orders) {
    if (o.payment_status === "refunded") continue;
    // Convert to IST date — easy local representation; Supabase stores UTC.
    const d = new Date(o.created_at);
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    const key = ist.toISOString().slice(0, 10);
    const split = gstSplitForOrder(o);
    const row = map.get(key) ?? { date: key, orders: 0, revenue: 0, gst: 0 };
    row.orders += 1;
    row.revenue += Number(o.total ?? 0);
    row.gst += split.total_gst;
    map.set(key, row);
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, revenue: round2(r.revenue), gst: round2(r.gst) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

// ──────────────────────────────────────────────
// Date-range parsing for the UI presets
// ──────────────────────────────────────────────

export type RangePreset = "today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month" | "custom";

export function presetRange(
  preset: RangePreset,
  custom?: { from?: string; to?: string }
): { from: string; to: string } {
  // Use IST day boundaries since the business is India-based.
  const now = new Date();
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const todayIst = istNow.toISOString().slice(0, 10);

  const dayShift = (iso: string, days: number) => {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const monthStart = (iso: string) => iso.slice(0, 7) + "-01";

  switch (preset) {
    case "today":      return { from: todayIst, to: todayIst };
    case "yesterday":  { const y = dayShift(todayIst, -1); return { from: y, to: y }; }
    case "7d":         return { from: dayShift(todayIst, -6), to: todayIst };
    case "30d":        return { from: dayShift(todayIst, -29), to: todayIst };
    case "this_month": return { from: monthStart(todayIst), to: todayIst };
    case "last_month": {
      const ms = monthStart(todayIst);
      const lastMonthEnd = dayShift(ms, -1);
      const lastMonthStart = monthStart(lastMonthEnd);
      return { from: lastMonthStart, to: lastMonthEnd };
    }
    case "custom":     return { from: custom?.from ?? todayIst, to: custom?.to ?? todayIst };
  }
}

// Convert a YYYY-MM-DD (IST) to a UTC ISO timestamp range for SQL filtering.
export function istDayToUtcRange(fromIst: string, toIst: string): { fromUtc: string; toUtc: string } {
  // IST = UTC + 5:30. IST 00:00 = previous UTC 18:30. IST 23:59:59.999 = next UTC 18:29:59.999.
  const istFromMs = Date.parse(fromIst + "T00:00:00") - 5.5 * 60 * 60 * 1000;
  const istToMs = Date.parse(toIst + "T23:59:59.999") - 5.5 * 60 * 60 * 1000;
  return { fromUtc: new Date(istFromMs).toISOString(), toUtc: new Date(istToMs).toISOString() };
}
