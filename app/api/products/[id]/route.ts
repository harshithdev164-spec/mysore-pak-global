export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";

// GET /api/products/:id  (accepts UUID id or slug)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { id } = params;

  // Try by UUID first, then by slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const query = supabase
    .from("products")
    .select(
      `
      id, name, slug, description, ingredients, storage,
      base_price, original_price, image, badge, rating, review_count,
      category:categories(id, name, slug),
      weights:product_weights(id, label, weight_grams, price, stock_quantity)
    `
    )
    .eq("is_active", true);

  const { data, error } = await (isUuid ? query.eq("id", id) : query.eq("slug", id)).single();

  if (error || !data) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Fetch reviews for this product too
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, customer_name, customer_location, rating, review_text, created_at")
    .eq("product_id", data.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ data: { ...data, reviews: reviews ?? [] } });
}

// PUT /api/products/:id — update product (admin)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    .update(productData)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !product) {
    return NextResponse.json({ error: error?.message ?? "Product not found" }, { status: 500 });
  }

  if (weights !== undefined) {
    await supabase.from("product_weights").delete().eq("product_id", params.id);
    if (Array.isArray(weights) && weights.length > 0) {
      await supabase
        .from("product_weights")
        .insert(weights.map((w) => ({ ...(w as object), product_id: params.id })));
    }
  }

  return NextResponse.json({ data: product });
}

// DELETE /api/products/:id — delete product (admin)
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  await supabase.from("product_weights").delete().eq("product_id", params.id);
  const { error } = await supabase.from("products").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
