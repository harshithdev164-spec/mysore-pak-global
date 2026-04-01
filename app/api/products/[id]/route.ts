export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient, createAdminClient } from "@/lib/supabase";
import { getCached, setCached, deleteCached, bumpProductsVersion, TTL } from "@/lib/redis";

// GET /api/products/:id  (accepts UUID id or slug)
// ?admin=true bypasses is_active filter and Redis cache (for admin edit pages)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const isAdmin = new URL(request.url).searchParams.get("admin") === "true";

  // Skip Redis cache for admin requests (always needs fresh data)
  if (!isAdmin) {
    const cacheKey = `product:${id}`;
    const cached = await getCached<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached }, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60", "X-Cache": "HIT" },
      });
    }
  }

  const supabase = isAdmin ? createAdminClient() : createServerClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase
    .from("products")
    .select(`
      id, name, slug, description, ingredients, storage,
      base_price, original_price, image, badge, rating, review_count,
      is_active, category_id,
      category:categories(id, name, slug),
      weights:product_weights(id, label, weight_grams, price, stock_quantity),
      reviews(id, customer_name, customer_location, rating, review_text, created_at)
    `);

  // Public requests only see active products; admin sees all
  if (!isAdmin) query = (query as typeof query).eq("is_active", true);

  const { data, error } = await (isUuid ? query.eq("id", id) : query.eq("slug", id)).single();

  if (error || !data) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Sort reviews by date desc and cap at 10 (single query — no second round-trip)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedReviews = ((data as any).reviews ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  // Ensure all weights have stock_quantity (default to 100 if missing)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedWeights = ((data as any).weights ?? []).map((w: any) => ({
    ...w,
    stock_quantity: w.stock_quantity ?? 100,
  }));

  const result = { ...data, reviews: sortedReviews, weights: normalizedWeights };

  // Cache by both slug and UUID so either lookup hits cache
  await setCached(`product:${data.slug}`, result, TTL.PRODUCT_DETAIL);
  await setCached(`product:${data.id}`, result, TTL.PRODUCT_DETAIL);

  return NextResponse.json({ data: result }, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60", "X-Cache": "MISS" },
  });
}

// PUT /api/products/:id — update product (admin)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { weights, ...productData } = body as { weights?: unknown[]; [key: string]: unknown };

  const { data: product, error } = await supabase
    .from("products").update(productData).eq("id", params.id).select().single();

  if (error || !product) return NextResponse.json({ error: error?.message ?? "Product not found" }, { status: 500 });

  if (weights !== undefined) {
    await supabase.from("product_weights").delete().eq("product_id", params.id);
    if (Array.isArray(weights) && weights.length > 0) {
      await supabase.from("product_weights").insert(weights.map((w) => ({ ...(w as object), product_id: params.id })));
    }
  }

  // Invalidate this product's cache + all list caches
  await deleteCached(`product:${params.id}`, `product:${product.slug}`);
  await bumpProductsVersion();
  revalidatePath("/shop");
  revalidatePath(`/product/${product.slug}`);

  return NextResponse.json({ data: product });
}

// DELETE /api/products/:id — delete product (admin)
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  // Fetch slug before deleting (needed for cache key)
  const { data: existing } = await supabase.from("products").select("slug").eq("id", params.id).single();

  await supabase.from("product_weights").delete().eq("product_id", params.id);
  const { error } = await supabase.from("products").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invalidate cache
  const keysToDelete = [`product:${params.id}`];
  if (existing?.slug) keysToDelete.push(`product:${existing.slug}`);
  await deleteCached(...keysToDelete);
  await bumpProductsVersion();
  revalidatePath("/shop");
  if (existing?.slug) revalidatePath(`/product/${existing.slug}`);

  return NextResponse.json({ success: true });
}
