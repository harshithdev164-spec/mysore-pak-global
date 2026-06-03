/**
 * DTDC India domestic shipping client. Matches the official customer
 * integration Postman collection.
 *
 * Hosts:
 *   Booking / label / cancel    Test: alphademodashboardapi.shipsy.io
 *                               Live: pxapi.dtdc.in
 *   Tracking (different stack)  Test: dtdcstagingapi.dtdc.com
 *                               Live: blktracksvc.dtdc.com
 *
 * Auth headers:
 *   `api-key`        — booking, label, cancel
 *   `x-access-token` — tracking
 *
 * Account identity: `customer_code` (booking) / `customerCode` (cancel) in body.
 */

// Booking/label/cancel base. Default to staging.
// Some deployments still have an old/wrong base URL set from before this
// integration was fixed. Treat any of these legacy values as effectively
// unset and fall through to the working default. Otherwise a stale
// Vercel env var silently breaks every booking with "fetch failed".
const BROKEN_BASE_URLS = new Set<string>([
  "https://apis.dtdc.in/dtdc-api/api/customer/integration",
  "https://apis.dtdc.in/dtdc-api/api",
  "https://api.dtdc.in/dtdc-api/api/customer/integration",
]);

function pickBaseUrl(): string {
  const fromEnv = (process.env.DTDC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv && !BROKEN_BASE_URLS.has(fromEnv)) return fromEnv;
  if (fromEnv && BROKEN_BASE_URLS.has(fromEnv)) {
    console.warn(
      `[dtdc] Ignoring stale DTDC_API_BASE_URL=${fromEnv} — falling back to default.`
    );
  }
  // Explicit opt-in for the live host: set DTDC_USE_LIVE=true AND swap to
  // your LIVE customer code / api-key / x-access-token. Sandbox creds will
  // 401 against pxapi.dtdc.in, so we don't auto-route there based on env.
  if (process.env.DTDC_USE_LIVE === "true") {
    return "https://pxapi.dtdc.in/api/customer/integration";
  }
  return "https://alphademodashboardapi.shipsy.io/api/customer/integration";
}

const BASE_URL = pickBaseUrl();

// Tracking lives on a different host. Default to staging.
const BROKEN_TRACKING_URLS = new Set<string>([
  "https://apis.dtdc.in/dtdc-api",
  "https://api.dtdc.in/dtdc-api",
]);

function pickTrackingBaseUrl(): string {
  const fromEnv = (process.env.DTDC_TRACKING_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv && !BROKEN_TRACKING_URLS.has(fromEnv)) return fromEnv;
  if (process.env.DTDC_USE_LIVE === "true") {
    return "https://blktracksvc.dtdc.com/dtdc-api";
  }
  return "https://dtdcstagingapi.dtdc.com/dtdc-tracking-api/dtdc-api";
}

const TRACKING_BASE_URL = pickTrackingBaseUrl();

function apiKey(): string { return process.env.DTDC_API_KEY ?? ""; }
function accessToken(): string { return process.env.DTDC_X_ACCESS_TOKEN ?? ""; }
function customerCode(): string { return process.env.DTDC_CUSTOMER_CODE ?? ""; }
function serviceTypeId(): string {
  return process.env.DTDC_SERVICE_TYPE_ID ?? "GROUND EXPRESS";
}
// commodity_id maps to DTDC's commodity master sheet; numeric string per account.
// Default "Other" works for many accounts; override with the correct numeric id
// from your DTDC commodity master if booking is rejected.
function commodityId(): string {
  return process.env.DTDC_COMMODITY_ID ?? "Other";
}

export function isDtdcConfigured(): boolean {
  return Boolean(apiKey()) && Boolean(customerCode());
}

// DTDC expects 10-digit Indian mobile (no '+', no country code, no spaces).
// Strip non-digits, drop leading 91/0, then truncate/pad checks.
function normalizeIndianPhone(raw: string): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  let p = digits;
  if (p.length === 12 && p.startsWith("91")) p = p.slice(2);
  else if (p.length === 11 && p.startsWith("0")) p = p.slice(1);
  return p;
}

// Catch obvious placeholder values left over from .env.example so the
// admin sees a clear error instead of a silent DTDC rejection.
function looksLikePlaceholder(v: string): boolean {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return true;
  return (
    s.includes("your address") ||
    s.includes("your name") ||
    s.includes("placeholder") ||
    /^\+?9?1?0{6,}$/.test(s.replace(/\D/g, ""))
  );
}

// ──────────────────────────────────────────────
// Debug capture
// ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lastExchange: { request: any; status: number; response: string; parsed?: any } | null = null;
export function getLastDtdcExchange() {
  return lastExchange;
}

// ──────────────────────────────────────────────
// Static domestic rate (used as the rate-quote source until DTDC's rate API is wired)
// ──────────────────────────────────────────────

export interface DtdcRateResult {
  rate_inr: number;
  etd_days: string;
}

/**
 * Static DTDC Ground Express rate for domestic India.
 * Single-zone simplification — adjust base/per-kg per your real DTDC contract.
 */
export function calculateDtdcStaticRate(weight_kg: number): DtdcRateResult {
  const base = parseFloat(process.env.DTDC_BASE_RATE_INR ?? "80");
  const perKg = parseFloat(process.env.DTDC_PER_KG_INR ?? "40");
  const w = Math.max(0.5, weight_kg);
  return {
    rate_inr: Math.ceil(base + perKg * w),
    etd_days: process.env.DTDC_ETD_DAYS ?? "3-5",
  };
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface DtdcOrderItem {
  name: string;
  units: number;
  selling_price: number;
}

export interface CreateDtdcOrderPayload {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: DtdcOrderItem[];
  subtotal: number;
  shipping_charges: number;
  weight_kg: number;
  payment_method: "Prepaid" | "COD";
}

export interface CreateDtdcOrderResult {
  reference_number: string;   // DTDC consignment / AWB number
  status: boolean;
  message?: string;
}

// ──────────────────────────────────────────────
// 1) Create consignment / booking — POST /consignment/softdata
// ──────────────────────────────────────────────

export async function createDtdcOrder(
  p: CreateDtdcOrderPayload
): Promise<CreateDtdcOrderResult> {
  if (!isDtdcConfigured()) {
    throw new Error("DTDC credentials not set (DTDC_API_KEY + DTDC_CUSTOMER_CODE)");
  }

  // ── Pickup (origin) config — DTDC-specific env vars only.
  // Fails loudly on placeholders since DTDC silently rejects bookings
  // with garbage origin data. ──
  const pickupName    = process.env.DTDC_PICKUP_NAME ?? "";
  const pickupPhone   = normalizeIndianPhone(process.env.DTDC_PICKUP_PHONE ?? "");
  const pickupAddress = process.env.DTDC_PICKUP_ADDRESS_LINE1 ?? "";
  const pickupAddress2 = process.env.DTDC_PICKUP_ADDRESS_LINE2 ?? "";
  const pickupPincode = process.env.DTDC_PICKUP_PINCODE ?? "";
  const pickupCity    = process.env.DTDC_PICKUP_CITY ?? "";
  const pickupState   = process.env.DTDC_PICKUP_STATE ?? "";

  if (!pickupName.trim()) {
    throw new Error("DTDC pickup name missing. Set DTDC_PICKUP_NAME in .env.local.");
  }
  if (looksLikePlaceholder(pickupAddress)) {
    throw new Error(
      "DTDC pickup address is missing or placeholder. Set DTDC_PICKUP_ADDRESS_LINE1 to your real warehouse address."
    );
  }
  if (pickupPhone.length !== 10) {
    throw new Error(
      `DTDC pickup phone is invalid (got "${process.env.DTDC_PICKUP_PHONE}"). Set DTDC_PICKUP_PHONE to a 10-digit Indian mobile.`
    );
  }
  if (!/^\d{6}$/.test(pickupPincode)) {
    throw new Error("DTDC pickup pincode invalid. Set DTDC_PICKUP_PINCODE to a 6-digit value.");
  }
  if (!pickupCity.trim() || !pickupState.trim()) {
    throw new Error("DTDC pickup city/state missing. Set DTDC_PICKUP_CITY and DTDC_PICKUP_STATE.");
  }

  // ── Destination validation ──
  const destPhone = normalizeIndianPhone(p.customer_phone);
  if (destPhone.length !== 10) {
    throw new Error(`Customer phone invalid for DTDC (got "${p.customer_phone}"). Must be 10 digits.`);
  }
  if (!/^\d{6}$/.test(p.pincode)) {
    throw new Error(`Destination pincode "${p.pincode}" is not a 6-digit Indian pincode.`);
  }

  const wKg = Math.max(0.5, p.weight_kg);
  const totalAmount = (p.subtotal + p.shipping_charges).toFixed(2);
  const productsDesc = p.items
    .map((i) => `${i.name} (x${i.units})`)
    .join(", ")
    .slice(0, 200);
  const isCod = p.payment_method === "COD";

  const body = {
    consignments: [
      {
        customer_code: customerCode(),
        service_type_id: serviceTypeId(),
        load_type: "NON-DOCUMENT",
        consignment_type: "Forward",
        dimension_unit: "CM",
        length: "20",
        width: "15",
        height: "10",
        weight_unit: "KG",
        weight: wKg.toFixed(2),
        declared_value: String(Math.round(p.subtotal)),
        num_pieces: "1",
        origin_details: {
          name: pickupName,
          phone: pickupPhone,
          alternate_phone: "",
          address_line_1: pickupAddress,
          address_line_2: pickupAddress2,
          pincode: pickupPincode,
          city: pickupCity,
          state: pickupState,
        },
        destination_details: {
          name: p.customer_name,
          phone: destPhone,
          alternate_phone: "",
          address_line_1: p.address,
          address_line_2: "",
          pincode: p.pincode,
          city: p.city,
          state: p.state,
        },
        customer_reference_number: p.order_number,
        cod_collection_mode: isCod ? "CASH" : "",
        cod_amount: isCod ? totalAmount : "",
        commodity_id: commodityId(),
        description: productsDesc,
        is_risk_surcharge_applicable: false,
        eway_bill: "",
        invoice_number: "",
        invoice_date: "",
        reference_number: "",
      },
    ],
  };

  const fullUrl = `${BASE_URL}/consignment/softdata`;
  let res: Response;
  try {
    res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey(),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure — DNS, timeout, TLS, etc. Surface the URL so
    // a stale env var doesn't masquerade as a generic "fetch failed".
    const cause = err instanceof Error ? (err as Error & { cause?: { code?: string; message?: string } }).cause : null;
    const causeMsg = cause?.code ?? cause?.message ?? "(no cause)";
    lastExchange = {
      request: body,
      status: 0,
      response: `Network error: ${err instanceof Error ? err.message : String(err)} [${causeMsg}] URL=${fullUrl}`,
    };
    throw new Error(
      `DTDC network error reaching ${fullUrl}: ${causeMsg}. ` +
        `Check DTDC_API_BASE_URL in env (must be a host that resolves).`
    );
  }

  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* non-JSON — leave parsed null */
  }
  lastExchange = { request: body, status: res.status, response: text, parsed };

  if (!res.ok) {
    throw new Error(`DTDC booking failed (${res.status}): ${text.slice(0, 600)}`);
  }

  // Response shapes vary; try a handful of common keys.
  const data = parsed?.data?.[0] ?? parsed?.consignments?.[0] ?? parsed?.[0] ?? parsed;
  const success = parsed?.success === true || data?.success === true || data?.status === "Success";
  const ref =
    data?.reference_number ??
    data?.referenceNumber ??
    data?.consignment_number ??
    data?.consignmentNumber ??
    data?.awb ??
    "";

  if (!success || !ref) {
    const msg =
      parsed?.message ??
      data?.message ??
      data?.error ??
      data?.reason ??
      "DTDC returned no consignment number";
    throw new Error(`DTDC booking returned failure: ${msg}`);
  }

  return {
    reference_number: ref,
    status: true,
    message: parsed?.message ?? data?.message,
  };
}

// ──────────────────────────────────────────────
// 2) Tracking — POST {TRACKING_BASE}/rest/JSONCnTrk/getTrackDetails
// ──────────────────────────────────────────────

export interface DtdcTrackingResult {
  raw_status: string;
  events: { ts: string; description: string }[];
}

export async function getDtdcTracking(
  reference_number: string
): Promise<DtdcTrackingResult | null> {
  if (!accessToken()) return null;

  const body = {
    trkType: "cnno",
    strcnno: reference_number,
    addtnlDtl: "Y",
  };

  try {
    const res = await fetch(
      `${TRACKING_BASE_URL}/rest/JSONCnTrk/getTrackDetails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": accessToken(),
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shipment: any = json?.trackHeader ?? json?.[0] ?? json;
    const raw =
      shipment?.strStatus ??
      shipment?.strScanType ??
      shipment?.status ??
      "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detailsArr: any[] = json?.trackDetails ?? json?.details ?? [];

    return {
      raw_status: String(raw),
      events: detailsArr.map((d) => ({
        ts: d.strActionDate ?? d.date ?? "",
        description: d.strAction ?? d.description ?? d.strRemarks ?? "",
      })),
    };
  } catch (err) {
    console.error("[dtdc] tracking threw:", err);
    return null;
  }
}

// ──────────────────────────────────────────────
// 3) Cancellation — POST /consignment/cancel
// ──────────────────────────────────────────────

export async function cancelDtdcConsignment(
  reference_number: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ ok: boolean; status: number; body: any }> {
  if (!isDtdcConfigured()) {
    throw new Error("DTDC credentials not set (DTDC_API_KEY + DTDC_CUSTOMER_CODE)");
  }
  const body = { AWBNo: [reference_number], customerCode: customerCode() };

  const res = await fetch(`${BASE_URL}/consignment/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey(),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch { /* non-JSON */ }
  lastExchange = { request: body, status: res.status, response: text, parsed };
  return { ok: res.ok, status: res.status, body: parsed ?? text };
}

// ──────────────────────────────────────────────
// 4) Shipping label — GET /consignment/shippinglabel/stream (returns PDF)
// ──────────────────────────────────────────────

export async function getDtdcShippingLabel(
  reference_number: string,
  opts: { label_code?: string; label_format?: "pdf" | "html" } = {}
): Promise<{ ok: boolean; status: number; pdf?: Buffer; error?: string }> {
  if (!isDtdcConfigured()) {
    throw new Error("DTDC credentials not set (DTDC_API_KEY + DTDC_CUSTOMER_CODE)");
  }
  const url = new URL(`${BASE_URL}/consignment/shippinglabel/stream`);
  url.searchParams.set("reference_number", reference_number);
  url.searchParams.set("label_code", opts.label_code ?? "SHIP_LABEL_4X6");
  url.searchParams.set("label_format", opts.label_format ?? "pdf");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey(),
    },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, error: (await res.text()).slice(0, 600) };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return { ok: true, status: res.status, pdf: buf };
}
