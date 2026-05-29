export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/chatbot/products?category=<slug>&q=<text>
//
// Lightweight product fetch tailored for the chat panel. Returns up to 6 active
// products with a minimal projection (image, name, slug, price range, badge).
//
// - `category` filters by `categories.slug` (e.g. "chocolates", "mysore-pak").
// - `q` runs a case-insensitive ilike across product name + description.
// - Combine either / both. With neither, returns the 6 newest active products.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim().toLowerCase() ?? "";
  const q = searchParams.get("q")?.trim() ?? "";

  const supabase = createServerClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, base_price, original_price, image, badge, rating, " +
        "category:categories(id, name, slug), " +
        "weights:product_weights(label, price)"
    )
    .eq("is_active", true)
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(6);

  if (category) {
    query = query.eq("category.slug", category);
  }

  if (q) {
    const safe = q.replace(/[,()]/g, " ");
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If a category filter returned 0 results (e.g. the slug doesn't exist), fall
  // back to a free-text match against the category label so customers always see
  // something rather than an empty card stack.
  if ((data?.length ?? 0) === 0 && category) {
    const { data: fallback } = await supabase
      .from("products")
      .select(
        "id, name, slug, base_price, original_price, image, badge, rating, " +
          "category:categories(id, name, slug), " +
          "weights:product_weights(label, price)"
      )
      .eq("is_active", true)
      .ilike("name", `%${category}%`)
      .limit(6);
    return NextResponse.json({ data: fallback ?? [] });
  }

  return NextResponse.json({ data: data ?? [] });
}
