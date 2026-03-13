// Cache public product listings for 60 s; mutation routes (POST) are always dynamic
export const revalidate = 60;
import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";

// GET /api/products?category=mysore-pak&sort=rating&limit=12&admin=true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "created_at";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const badge = searchParams.get("badge");
  const isAdmin = searchParams.get("admin") === "true";

  // Admin requests use service role key to bypass RLS (see all products including inactive)
  const supabase = isAdmin ? createAdminClient() : createServerClient();

  let query = supabase
    .from("products")
    .select(
      `
      id, name, slug, description, ingredients, storage,
      base_price, original_price, image, badge, rating, review_count, is_active,
      category:categories(id, name, slug),
      weights:product_weights(id, label, weight_grams, price, stock_quantity)
    `
    )
    .limit(limit);

  if (!isAdmin) query = query.eq("is_active", true);

  // Filter by category slug
  if (category && category !== "all") {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  // Filter by badge (e.g. "Bestseller", "New", "Premium")
  if (badge) query = query.eq("badge", badge);

  // Sorting
  switch (sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/products — create a new product (admin)
export async function POST(request: Request) {
  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { weights, ...productData } = body as { weights?: unknown[]; [key: string]: unknown };

  const { data: product, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error || !product) {
    return NextResponse.json({ error: error?.message ?? "Failed to create product" }, { status: 500 });
  }

  if (weights && Array.isArray(weights) && weights.length > 0) {
    const { error: weightsError } = await supabase
      .from("product_weights")
      .insert(weights.map((w) => ({ ...(w as object), product_id: product.id })));
    if (weightsError) {
      return NextResponse.json({ error: weightsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ data: product }, { status: 201 });
}
