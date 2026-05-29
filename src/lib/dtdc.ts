/**
 * DTDC India domestic shipping client.
 *
 * Auth model (from DTDC's standard customer integration docs):
 *   - Booking / label / cancel: `api-key` header (env: DTDC_API_KEY)
 *   - Tracking: `x-access-token` header (env: DTDC_X_ACCESS_TOKEN)
 *   - Account identity: `customer_code` in body (env: DTDC_CUSTOMER_CODE)
 *
 * NOTE: The exact JSON field names / endpoint paths below are based on DTDC's
 * standard customer integration API. Verify against the actual docs at:
 *   https://drive.google.com/file/d/1jhNe7esBoiWDxrtogwGp6teTdUA7dDsG  (booking)
 *   https://drive.google.com/file/d/1b6hywYQ7K9-IjOBsocq3eojhSUhF_AmB  (tracking)
 *   https://drive.google.com/file/d/1OHeNRDmNSxxMVBygwzcdIWleXHRBBV-Y  (label)
 *
 * If real DTDC responses differ, use /api/admin/dtdc/debug to surface the raw
 * exchange and adjust the field names here.
 */

const BASE_URL =
  process.env.DTDC_API_BASE_URL ?? "https://apis.dtdc.in/dtdc-api/api/customer/integration";

function apiKey(): string { return process.env.DTDC_API_KEY ?? ""; }
function accessToken(): string { return process.env.DTDC_X_ACCESS_TOKEN ?? ""; }
function customerCode(): string { return process.env.DTDC_CUSTOMER_CODE ?? ""; }
function serviceTypeId(): string {
  return process.env.DTDC_SERVICE_TYPE_ID ?? "GROUND EXPRESS";
}

export function isDtdcConfigured(): boolean {
  return Boolean(apiKey()) && Boolean(customerCode());
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
        dimension_unit: "cm",
        length: "20",
        width: "15",
        height: "10",
        weight_unit: "kg",
        weight: wKg.toFixed(2),
        declared_value: String(Math.round(p.subtotal)),
        num_pieces: "1",
        origin_details: {
          name: process.env.DHL_PICKUP_NAME ?? "World of Mysore Pak",
          phone: process.env.DHL_PICKUP_PHONE ?? "",
          alternate_phone: "",
          address_line_1: process.env.DHL_PICKUP_ADDRESS_LINE1 ?? "",
          address_line_2: "",
          pincode: process.env.DELHIVERY_PICKUP_PINCODE ?? "570011",
          city: process.env.DHL_PICKUP_CITY ?? "Mysuru",
          state: process.env.DHL_PICKUP_STATE_NAME ?? "Karnataka",
        },
        destination_details: {
          name: p.customer_name,
          phone: p.customer_phone,
          alternate_phone: "",
          address_line_1: p.address,
          address_line_2: "",
          pincode: p.pincode,
          city: p.city,
          state: p.state,
        },
        customer_reference_number: p.order_number,
        cod_collection_mode: isCod ? "Cash" : "",
        cod_amount: isCod ? totalAmount : "",
        commodity_id: "Other",
        description: productsDesc,
        return_details: undefined,
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/consignment/softdata`, {
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
// 2) Tracking — POST /tracking/getRoutingDetails (or similar)
// ──────────────────────────────────────────────

export interface DtdcTrackingResult {
  raw_status: string;
  events: { ts: string; description: string }[];
}

export async function getDtdcTracking(
  reference_number: string
): Promise<DtdcTrackingResult | null> {
  if (!accessToken() && !isDtdcConfigured()) return null;

  const body = {
    trkType: "cnno",
    strcnno: reference_number,
    addtnlDtl: "Y",
  };

  try {
    const res = await fetch(
      `${BASE_URL.replace("/customer/integration", "")}/tracking/api/v1/track-by-cnno`,
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
