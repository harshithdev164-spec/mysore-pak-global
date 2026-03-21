/**
 * Shiprocket API client
 * - Token cached in Redis for 230 hours (token expires at 240h)
 * - All API errors are thrown; callers must handle gracefully
 */
import { getCached, setCached } from "./redis";

const BASE = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_CACHE_KEY = "shiprocket:token";
const TOKEN_TTL_S = 230 * 60 * 60; // 230 hours (buffer before 240hr expiry)

// ── Auth ────────────────────────────────────────────────────────────────────

async function fetchFreshToken(): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Shiprocket auth failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  if (!data.token) throw new Error("Shiprocket: no token in login response");
  return data.token as string;
}

export async function getToken(): Promise<string> {
  const cached = await getCached<string>(TOKEN_CACHE_KEY);
  if (cached) return cached;
  const token = await fetchFreshToken();
  await setCached(TOKEN_CACHE_KEY, token, TOKEN_TTL_S);
  return token;
}

// ── Fetch wrapper ────────────────────────────────────────────────────────────

async function srFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const doReq = (token: string) =>
    fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...((options.headers as Record<string, string>) ?? {}),
      },
    });

  let token = await getToken();
  let res = await doReq(token);

  // Refresh and retry once on 401
  if (res.status === 401) {
    token = await fetchFreshToken();
    await setCached(TOKEN_CACHE_KEY, token, TOKEN_TTL_S);
    res = await doReq(token);
  }

  return res;
}

// ── Utilities ────────────────────────────────────────────────────────────────

/** Parse weight label → kilograms. "250g" → 0.25 | "1kg" → 1.0 | "500gm" → 0.5 */
export function parseWeightKg(label: string): number {
  const s = label.toLowerCase().replace(/\s+/g, "");
  const kg = s.match(/([\d.]+)kg/);
  if (kg) return parseFloat(kg[1]);
  const g = s.match(/([\d.]+)(?:gm|g)/);
  if (g) return parseFloat(g[1]) / 1000;
  return 0.5;
}

// ── Serviceability ───────────────────────────────────────────────────────────

export interface CourierRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string; // estimated delivery days string e.g. "2-3"
}

export async function checkServiceability(
  delivery_postcode: string,
  weight_kg: number
): Promise<CourierRate[]> {
  const pickup_postcode = process.env.SHIPROCKET_PICKUP_PINCODE ?? "570001";
  const params = new URLSearchParams({
    pickup_postcode,
    delivery_postcode: delivery_postcode.trim(),
    weight: String(Math.max(weight_kg, 0.1).toFixed(2)),
    cod: "0",
  });

  const res = await srFetch(`/courier/serviceability/?${params}`);
  if (!res.ok) return [];

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const couriers: any[] = json?.data?.available_courier_companies ?? [];

  return couriers
    .map((c) => ({
      courier_company_id: c.courier_company_id as number,
      courier_name: c.courier_name as string,
      rate: Math.round(Number(c.rate ?? c.freight_charge ?? 0)),
      etd: String(c.estimated_delivery_days ?? c.etd ?? "3-5"),
    }))
    .filter((c) => c.rate > 0)
    .sort((a, b) => a.rate - b.rate);
}

// ── Order creation ───────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  order_number: string;
  order_date: string; // "YYYY-MM-DD HH:mm"
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; sku: string; units: number; selling_price: number }[];
  subtotal: number;
  shipping_charges: number;
  weight_kg: number;
}

export interface ShiprocketOrderResult {
  order_id: number;
  shipment_id: number;
  awb_code?: string;
  courier_name?: string;
  tracking_url?: string;
  label_url?: string;
}

export async function createShiprocketOrder(
  p: CreateOrderPayload
): Promise<ShiprocketOrderResult> {
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION ?? "Primary";

  const body = {
    order_id: p.order_number,
    order_date: p.order_date,
    pickup_location: pickupLocation,
    billing_customer_name: p.customer_name,
    billing_last_name: "",
    billing_address: p.address,
    billing_city: p.city,
    billing_pincode: p.pincode,
    billing_state: p.state,
    billing_country: "India",
    billing_email: p.customer_email,
    billing_phone: p.customer_phone,
    shipping_is_billing: true,
    order_items: p.items,
    payment_method: "Prepaid",
    sub_total: p.subtotal,
    shipping_charges: p.shipping_charges,
    length: 20,
    breadth: 15,
    height: 10,
    weight: Math.max(p.weight_kg, 0.1),
  };

  const res = await srFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Shiprocket createOrder failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return {
    order_id: data.order_id,
    shipment_id: data.shipment_id,
    awb_code: data.awb_code ?? undefined,
    courier_name: data.courier_name ?? undefined,
    tracking_url: data.tracking_url ?? undefined,
    label_url: data.label_url ?? undefined,
  };
}

// ── AWB / Label / Invoice ────────────────────────────────────────────────────

export async function generateAWB(shipment_id: number, courier_id: number) {
  const res = await srFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id, courier_id }),
  });
  if (!res.ok) throw new Error(`AWB generation failed (${res.status})`);
  return res.json();
}

export async function generateLabel(shipment_id: number) {
  const res = await srFetch("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [shipment_id] }),
  });
  if (!res.ok) throw new Error(`Label generation failed (${res.status})`);
  return res.json();
}

export async function generateInvoice(shiprocket_order_id: number) {
  const res = await srFetch("/orders/print/invoice", {
    method: "POST",
    body: JSON.stringify({ ids: [shiprocket_order_id] }),
  });
  if (!res.ok) throw new Error(`Invoice generation failed (${res.status})`);
  return res.json();
}

export async function getOrderTracking(awb_code: string) {
  const res = await srFetch(`/courier/track/awb/${awb_code}`);
  if (!res.ok) return null;
  return res.json();
}
