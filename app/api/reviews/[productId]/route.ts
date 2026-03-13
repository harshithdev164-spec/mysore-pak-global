import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";

const ReviewSchema = z.object({
  customer_name: z.string().min(2),
  customer_location: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(10),
});

// GET /api/reviews/:productId — fetch reviews for a product (UUID or slug)
export async function GET(
  _request: Request,
  { params }: { params: { productId: string } }
) {
  const supabase = createServerClient();
  const { productId } = params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

  let resolvedId = productId;

  if (!isUuid) {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productId)
      .single();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    resolvedId = product.id;
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, customer_location, rating, review_text, is_featured, created_at")
    .eq("product_id", resolvedId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/reviews/:productId — submit a new review
export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const supabase = createServerClient();
  const { productId } = params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
  let resolvedId = productId;

  if (!isUuid) {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productId)
      .single();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    resolvedId = product.id;
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({ product_id: resolvedId, ...parsed.data })
    .select("id, customer_name, rating, review_text, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to submit review" }, { status: 500 });
  }

  // Update product average rating
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", resolvedId);

  if (allReviews && allReviews.length > 0) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase
      .from("products")
      .update({ rating: Math.round(avg * 10) / 10, review_count: allReviews.length })
      .eq("id", resolvedId);
  }

  return NextResponse.json({ data }, { status: 201 });
}
