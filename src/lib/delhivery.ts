/**
 * Delhivery One API client
 */
const BASE_URL = "https://track.delhivery.com";

interface CourierRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string;
}

export function parseWeightKg(label: string): number {
  const s = label.toLowerCase().replace(/\s+/g, "");
  const kg = s.match(/([\d.]+)kg/);
  if (kg) return parseFloat(kg[1]);
  const g = s.match(/([\d.]+)(?:gm|g)/);
  if (g) return parseFloat(g[1]) / 1000;
  return 0.5;
}

export async function checkServiceability(
  delivery_postcode: string,
  weight_kg: number
): Promise<CourierRate[]> {
  const token = process.env.DELHIVERY_TOKEN;
  const pickup_postcode = process.env.DELHIVERY_PICKUP_PINCODE ?? "570011";
  
  if (!token) return [];

  const weightInGrams = Math.max(weight_kg, 0.1) * 1000;
  
  const params = new URLSearchParams({
    md: "E", // Express
    ss: "Delivered",
    d_pin: delivery_postcode.trim(),
    o_pin: pickup_postcode,
    wt: String(weightInGrams),
  });

  try {
    const res = await fetch(`${BASE_URL}/api/kinko/v1/invoice/charges/.json?${params}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return [];
    
    const json = await res.json();
    
    // Delhivery returns an array of charges or a single object. 
    // Adapting to our frontend CourierRate format:
    if (json && json[0] && json[0].total_amount) {
      return [{
        courier_company_id: 1, // Static for Delhivery
        courier_name: "Delhivery",
        rate: Math.ceil(json[0].total_amount),
        etd: "3-5",
      }];
    }
  } catch (error) {
    console.error("[Delhivery] Rate calc failed:", error);
  }

  // Fallback if Delhivery rate API is unreachable or format doesn't match
  return [{
    courier_company_id: 1,
    courier_name: "Delhivery",
    rate: 99,
    etd: "3-5",
  }];
}

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
  payment_method: "Prepaid" | "COD";
}

export interface DelhiveryOrderResult {
  package_id?: string;
  waybill?: string;
  status: boolean;
  message?: string;
}

export async function createDelhiveryOrder(p: CreateOrderPayload): Promise<DelhiveryOrderResult> {
  const token = process.env.DELHIVERY_TOKEN;
  const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION;

  if (!token) throw new Error("Missing DELHIVERY_TOKEN");
  if (!pickupLocation) throw new Error("Missing DELHIVERY_PICKUP_LOCATION");

  const weightInGrams = Math.max(p.weight_kg, 0.1) * 1000;
  
  // Format items nicely
  const productsDesc = p.items.map(i => `${i.name} (x${i.units})`).join(", ");

  const payload = {
    shipments: [
      {
        name: p.customer_name,
        add: p.address,
        pin: p.pincode,
        city: p.city,
        state: p.state,
        country: "India",
        phone: p.customer_phone,
        order: p.order_number,
        payment_mode: p.payment_method, // "Pre-paid" or "COD"
        return_pin: p.pincode,
        return_city: p.city,
        return_phone: p.customer_phone,
        return_add: p.address,
        return_state: p.state,
        return_country: "India",
        products_desc: productsDesc.substring(0, 200), // Enforce limit
        hsn_code: "",
        cod_amount: p.payment_method === "COD" ? p.subtotal + p.shipping_charges : "0",
        order_date: p.order_date,
        total_amount: String(p.subtotal + p.shipping_charges),
        seller_inv: p.order_number,
        quantity: String(p.items.reduce((sum, item) => sum + item.units, 0)),
        weight: String(weightInGrams),
        shipping_mode: "Express"
      }
    ],
    pickup_location: {
      name: pickupLocation
    }
  };

  const form = new URLSearchParams();
  form.append("format", "json");
  form.append("data", JSON.stringify(payload));

  const res = await fetch(`${BASE_URL}/api/cmu/create.json`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: form.toString()
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Delhivery createOrder failed (${res.status}): ${err}`);
  }

  const json = await res.json();
  
  if (!json.success) {
      // Sometimes it returns success: false with an error array
      const errs = json.rmk || json.error || "Unknown Error";
      throw new Error(`Delhivery returned failure: ${JSON.stringify(errs)}`);
  }

  const packageRef = json.packages && json.packages[0];
  
  return {
    status: json.success,
    waybill: packageRef?.waybill,
    package_id: packageRef?.refnum,
    message: json.rmk
  };
}

export async function getDelhiveryTracking(waybill: string) {
  const token = process.env.DELHIVERY_TOKEN;
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/api/v1/packages/json/?waybill=${waybill}&token=${token}`);
  if (!res.ok) return null;
  return res.json();
}
