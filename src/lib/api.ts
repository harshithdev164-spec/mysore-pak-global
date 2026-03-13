// ============================================================
// Frontend API client — all calls go through Next.js API routes
// ============================================================

const BASE = "/api";

// ── Types ──────────────────────────────────────────────────

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  storage: string;
  base_price: number;
  original_price: number | null;
  image: string;
  badge: string | null;
  rating: number;
  review_count: number;
  category: { id: string; name: string; slug: string } | null;
  weights: Array<{ id: string; label: string; weight_grams: number; price: number; stock_quantity: number }>;
  reviews?: ApiReview[];
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
}

export interface ApiReview {
  id: string;
  customer_name: string;
  customer_location: string | null;
  rating: number;
  review_text: string;
  is_featured?: boolean;
  created_at: string;
}

export interface ApiOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_status: string;
  created_at: string;
  items?: ApiOrderItem[];
}

export interface ApiOrderItem {
  id: string;
  product_name: string;
  weight_label: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    product_id?: string;
    product_weight_id?: string;
    product_name: string;
    weight_label: string;
    quantity: number;
    unit_price: number;
  }>;
  payment_method?: string;
  notes?: string;
}

// ── Helper ─────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "API error");
  return json;
}

// ── Products ───────────────────────────────────────────────

export async function getProducts(params?: {
  category?: string;
  sort?: "price_asc" | "price_desc" | "rating";
  limit?: number;
  badge?: string;
}): Promise<ApiProduct[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.badge) qs.set("badge", params.badge);
  const { data } = await apiFetch<{ data: ApiProduct[] }>(`${BASE}/products?${qs.toString()}`);
  return data;
}

export async function getProduct(idOrSlug: string): Promise<ApiProduct> {
  const { data } = await apiFetch<{ data: ApiProduct }>(`${BASE}/products/${idOrSlug}`);
  return data;
}

// ── Categories ─────────────────────────────────────────────

export async function getCategories(): Promise<ApiCategory[]> {
  const { data } = await apiFetch<{ data: ApiCategory[] }>(`${BASE}/categories`);
  return data;
}

// ── Orders ─────────────────────────────────────────────────

export async function createOrder(payload: CreateOrderPayload): Promise<ApiOrder> {
  const { data } = await apiFetch<{ data: ApiOrder }>(`${BASE}/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function getOrder(idOrNumber: string): Promise<ApiOrder> {
  const { data } = await apiFetch<{ data: ApiOrder }>(`${BASE}/orders/${idOrNumber}`);
  return data;
}

export async function getOrdersByEmail(email: string): Promise<ApiOrder[]> {
  const { data } = await apiFetch<{ data: ApiOrder[] }>(`${BASE}/orders?email=${encodeURIComponent(email)}`);
  return data;
}

// ── Reviews ────────────────────────────────────────────────

export async function getReviews(productIdOrSlug: string): Promise<ApiReview[]> {
  const { data } = await apiFetch<{ data: ApiReview[] }>(`${BASE}/reviews/${productIdOrSlug}`);
  return data;
}

export async function submitReview(
  productIdOrSlug: string,
  review: {
    customer_name: string;
    customer_location?: string;
    rating: number;
    review_text: string;
  }
): Promise<ApiReview> {
  const { data } = await apiFetch<{ data: ApiReview }>(`${BASE}/reviews/${productIdOrSlug}`, {
    method: "POST",
    body: JSON.stringify(review),
  });
  return data;
}
