/**
 * GST + invoice helpers for Indian invoices (CGST/SGST/IGST).
 *
 * Seller config comes from env (DHL_GSTIN, DHL_PICKUP_STATE_NAME, etc.) so
 * everything stays in sync with the courier integration.
 */

export const SELLER = {
  name: "World of Mysore Pak",
  legalName: "World of Mysore Pak",
  gstin: process.env.NEXT_PUBLIC_GSTIN ?? process.env.DHL_GSTIN ?? "29AAKFI8322D1ZB",
  pan: "AAKFI8322D",
  stateCode: process.env.NEXT_PUBLIC_GST_STATE_CODE ?? process.env.DHL_PICKUP_STATE_CODE ?? "29",
  stateName:
    process.env.NEXT_PUBLIC_GST_STATE_NAME ?? process.env.DHL_PICKUP_STATE_NAME ?? "Karnataka",
  address: "Mysuru, Karnataka",
  pincode: process.env.NEXT_PUBLIC_PICKUP_PINCODE ?? "570011",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+91 63648 95255",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "support@worldofmysorepak.com",
  bank: process.env.NEXT_PUBLIC_AD_CODE ?? "AD Code: 050010",
};

// Indian state code lookup — used to determine intra-state vs inter-state GST.
// Full list of GSTIN state codes (only the common ones; extendable).
const STATE_BY_NAME: Record<string, string> = {
  "andhra pradesh": "37", "arunachal pradesh": "12", assam: "18", bihar: "10",
  chhattisgarh: "22", goa: "30", gujarat: "24", haryana: "06",
  "himachal pradesh": "02", jharkhand: "20", karnataka: "29", kerala: "32",
  "madhya pradesh": "23", maharashtra: "27", manipur: "14", meghalaya: "17",
  mizoram: "15", nagaland: "13", odisha: "21", punjab: "03", rajasthan: "08",
  sikkim: "11", "tamil nadu": "33", telangana: "36", tripura: "16",
  "uttar pradesh": "09", uttarakhand: "05", "west bengal": "19", delhi: "07",
  "jammu and kashmir": "01", ladakh: "38", chandigarh: "04", puducherry: "34",
  "andaman and nicobar islands": "35", "dadra and nagar haveli": "26",
  "daman and diu": "25", lakshadweep: "31",
};

export function stateCodeFor(stateName: string | undefined | null): string {
  if (!stateName) return "";
  return STATE_BY_NAME[stateName.trim().toLowerCase()] ?? "";
}

// GST rate per HSN bucket. Mysore Pak / sweets HSN 1704 → 5%.
// Chocolate HSN 1806 → 18%. Adjust per your product mapping.
export function gstRateForCategory(category: string | undefined | null): number {
  const c = (category ?? "").toLowerCase();
  if (c.includes("chocolate")) return 18;
  return 5;
}

export function hsnForCategory(category: string | undefined | null): string {
  const c = (category ?? "").toLowerCase();
  if (c.includes("chocolate")) return "1806";
  return "1704";
}

export interface InvoiceLine {
  description: string;
  hsn: string;
  qty: number;
  rate: number;          // unit price (taxable, ex-GST) — derived from inclusive price
  taxableValue: number;  // qty * rate
  gstRate: number;       // e.g. 5 or 18
  cgst: number;
  sgst: number;
  igst: number;
  total: number;         // taxableValue + cgst + sgst + igst
}

export interface InvoiceSummary {
  lines: InvoiceLine[];
  taxableValue: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  shippingCharge: number;
  grandTotal: number;
  totalGst: number;
  isInterState: boolean;
  isExport: boolean;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  amountInWords: string;
}

interface OrderItemInput {
  product_name: string;
  weight_label?: string;
  category?: string | null;
  quantity: number;
  unit_price: number;     // INCLUSIVE price actually shown to customer at checkout
  total_price?: number;
}

interface ShippingAddress {
  state?: string | null;
  country?: string | null;
}

/**
 * Build a complete invoice summary from an order's items + shipping address +
 * shipping cost. unit_price values are treated as **GST-inclusive** — taxable
 * value is back-calculated so totals match what the customer paid at checkout.
 */
export function buildInvoice(
  items: OrderItemInput[],
  shippingCost: number,
  shippingAddress: ShippingAddress,
): InvoiceSummary {
  const buyerState = (shippingAddress.state ?? "").trim();
  const buyerCountry = (shippingAddress.country ?? "IN").toUpperCase();
  const isExport = buyerCountry !== "IN";
  const buyerStateCode = stateCodeFor(buyerState);
  const isInterState = !isExport && buyerStateCode !== "" && buyerStateCode !== SELLER.stateCode;

  let cgstTotal = 0, sgstTotal = 0, igstTotal = 0, taxableTotal = 0;
  const lines: InvoiceLine[] = items.map((it) => {
    const gstRate = isExport ? 0 : gstRateForCategory(it.category);
    const inclusive = it.unit_price * it.quantity;
    // Back out the taxable portion: taxable = inclusive / (1 + rate/100)
    const taxableValue = +(inclusive / (1 + gstRate / 100)).toFixed(2);
    const taxAmt = +(inclusive - taxableValue).toFixed(2);

    let cgst = 0, sgst = 0, igst = 0;
    if (!isExport) {
      if (isInterState) {
        igst = taxAmt;
      } else {
        cgst = +(taxAmt / 2).toFixed(2);
        sgst = +(taxAmt - cgst).toFixed(2); // absorb rounding
      }
    }

    cgstTotal += cgst; sgstTotal += sgst; igstTotal += igst;
    taxableTotal += taxableValue;

    const desc = it.weight_label ? `${it.product_name} (${it.weight_label})` : it.product_name;

    return {
      description: desc,
      hsn: hsnForCategory(it.category),
      qty: it.quantity,
      rate: +(taxableValue / it.quantity).toFixed(2),
      taxableValue,
      gstRate,
      cgst,
      sgst,
      igst,
      total: +(taxableValue + cgst + sgst + igst).toFixed(2),
    };
  });

  const totalGst = +(cgstTotal + sgstTotal + igstTotal).toFixed(2);
  const grandTotal = +(taxableTotal + totalGst + shippingCost).toFixed(2);

  return {
    lines,
    taxableValue: +taxableTotal.toFixed(2),
    cgstTotal: +cgstTotal.toFixed(2),
    sgstTotal: +sgstTotal.toFixed(2),
    igstTotal: +igstTotal.toFixed(2),
    shippingCharge: +shippingCost.toFixed(2),
    grandTotal,
    totalGst,
    isInterState,
    isExport,
    placeOfSupply: isExport
      ? `${buyerCountry} (Export)`
      : buyerState || "—",
    placeOfSupplyCode: isExport ? "96" : buyerStateCode || "—",
    amountInWords: rupeesInWords(grandTotal),
  };
}

// ─────────────────────────────────────────────────────────
// Amount in words — Indian system (Lakh, Crore)
// ─────────────────────────────────────────────────────────
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigit(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}

function threeDigit(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  let out = "";
  if (h) out += ONES[h] + " Hundred";
  if (r) out += (h ? " " : "") + twoDigit(r);
  return out;
}

export function rupeesInWords(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  let words = "";
  if (crore) words += twoDigit(crore) + " Crore ";
  if (lakh) words += twoDigit(lakh) + " Lakh ";
  if (thousand) words += twoDigit(thousand) + " Thousand ";
  if (remainder) words += threeDigit(remainder);
  words = words.trim() + " Rupees";

  if (paise) {
    words += " and " + twoDigit(paise) + " Paise";
  }
  return words + " Only";
}
