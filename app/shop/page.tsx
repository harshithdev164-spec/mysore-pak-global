import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase";
import Shop from "@/views/Shop";

// ISR: re-generate at most every 60 seconds. No searchParams in this component
// so the route can be cached. Client-side filtering handles category/sort.
export const revalidate = 60;

export default async function ShopPage() {
  const supabase = createServerClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, base_price, original_price, image, badge, rating, review_count, category:categories(id, name, slug), weights:product_weights(id, label, price, stock_quantity)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug, image")
      .order("name"),
  ]);

  return (
    <Suspense>
      <Shop initialProducts={products ?? []} initialCategories={categories ?? []} />
    </Suspense>
  );
}
