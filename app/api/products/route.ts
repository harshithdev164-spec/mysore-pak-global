export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient, createAdminClient } from "@/lib/supabase";
import { getCached, setCached, bumpProductsVersion, getProductsVersion, TTL } from "@/lib/redis";

// GET /api/products?category=mysore-pak&sort=rating&limit=12&admin=true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "created_at";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const badge = searchParams.get("badge");
  const isAdmin = searchParams.get("admin") === "true";
  const featured = searchParams.get("featured") === "true";
  const slim = searchParams.get("slim") === "true";

  // Admin bypasses Redis cache (always fresh)
  if (!isAdmin) {
    const version = await getProductsVersion();
    const cacheKey = `products:v${version}:${searchParams.toString()}`;
    const cached = await getCached<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }
  }

  const supabase = isAdmin ? createAdminClient() : createServerClient();

  const selectFields = slim
    ? "id, name, slug, base_price, image, badge, rating, review_count, is_active, is_featured, category:categories(id, name, slug)"
    : "id, name, slug, description, ingredients, storage, base_price, original_price, image, badge, rating, review_count, is_active, is_featured, category:categories(id, name, slug), weights:product_weights(id, label, weight_grams, price, stock_quantity)";

  let query = supabase.from("products").select(selectFields).limit(limit);

  if (!isAdmin) query = query.eq("is_active", true);
  if (featured) query = query.eq("is_featured", true);

  if (category && category !== "all") {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (badge) query = query.eq("badge", badge);

  switch (sort) {
    case "price_asc": query = query.order("base_price", { ascending: true }); break;
    case "price_desc": query = query.order("base_price", { ascending: false }); break;
    case "rating": query = query.order("rating", { ascending: false }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!isAdmin && data) {
    const version = await getProductsVersion();
    const cacheKey = `products:v${version}:${searchParams.toString()}`;
    await setCached(cacheKey, data, TTL.PRODUCTS_LIST);
  }

  return NextResponse.json({ data }, {
    headers: isAdmin ? {} : { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60", "X-Cache": "MISS" },
  });
}

// POST /api/products — create a new product (admin)
export async function POST(request: Request) {
  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { weights, ...productData } = body as { weights?: unknown[]; [key: string]: unknown };

  const { data: product, error } = await supabase.from("products").insert(productData).select().single();
  if (error || !product) return NextResponse.json({ error: error?.message ?? "Failed to create product" }, { status: 500 });

  if (weights && Array.isArray(weights) && weights.length > 0) {
    const { error: weightsError } = await supabase.from("product_weights").insert(weights.map((w) => ({ ...(w as object), product_id: product.id })));
    if (weightsError) return NextResponse.json({ error: weightsError.message }, { status: 500 });
  }

  await bumpProductsVersion();
  revalidatePath("/shop");
  return NextResponse.json({ data: product }, { status: 201 });
}
