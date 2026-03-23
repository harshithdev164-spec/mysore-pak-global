export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

interface WeightData {
  label: string;
  weight_grams: number;
  price: number;
  stock_quantity?: number;
}

interface ProductInput {
  name: string;
  slug: string;
  description?: string;
  ingredients?: string;
  storage?: string;
  category_slug?: string;
  base_price: number;
  original_price?: number;
  image?: string;
  badge?: string;
  is_active?: boolean;
  weights?: WeightData[];
}

export async function POST(request: Request) {
  const supabase = createAdminClient();

  let body: { products: ProductInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { products } = body;
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "No products provided" }, { status: 400 });
  }

  // Build category slug → id map (auto-create missing categories)
  const categorySlugs = Array.from(new Set(products.map((p) => p.category_slug).filter(Boolean))) as string[];
  const categoryMap: Record<string, string> = {};

  for (const slug of categorySlugs) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
    if (cat) {
      categoryMap[slug] = cat.id;
    } else {
      const name = slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const { data: newCat } = await supabase
        .from("categories")
        .insert({ name, slug })
        .select("id")
        .single();
      if (newCat) categoryMap[slug] = newCat.id;
    }
  }

  const results: { inserted: number; updated: number; errors: string[] } = {
    inserted: 0,
    updated: 0,
    errors: [],
  };

  for (const product of products) {
    const { weights, category_slug, ...productData } = product;

    const insertData = {
      ...productData,
      category_id: category_slug ? categoryMap[category_slug] ?? null : null,
      is_active: productData.is_active ?? true,
    };

    // Check if slug already exists (upsert)
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", insertData.slug)
      .maybeSingle();

    let productId: string;

    if (existing) {
      const { error: updateErr } = await supabase
        .from("products")
        .update(insertData)
        .eq("id", existing.id);
      if (updateErr) {
        results.errors.push(`${product.name}: ${updateErr.message}`);
        continue;
      }
      productId = existing.id;
      results.updated++;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("products")
        .insert(insertData)
        .select("id")
        .single();
      if (insertErr || !inserted) {
        results.errors.push(`${product.name}: ${insertErr?.message ?? "insert failed"}`);
        continue;
      }
      productId = inserted.id;
      results.inserted++;
    }

    // Replace weight variants
    if (weights && weights.length > 0) {
      await supabase.from("product_weights").delete().eq("product_id", productId);
      const { error: wErr } = await supabase
        .from("product_weights")
        .insert(weights.map((w) => ({ ...w, product_id: productId })));
      if (wErr) {
        results.errors.push(`${product.name} weights: ${wErr.message}`);
      }
    }
  }

  return NextResponse.json(results);
}
