import { createServerClient } from "@/lib/supabase";
import Index from "@/views/Index";

// ISR: regenerate at most every 60 s so featured products stay fresh
export const revalidate = 60;

const FEATURED_SLUGS = [
  "spl-mysore-pak",
  "carrot-mysore-pak",
  "hazelnut-dark-chocolate",
  "milk-chocolate",
  "badam-halwa",
  "soan-cake",
];

export default async function Home() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, base_price, original_price, image, badge, rating, review_count, " +
      "category:categories(id, name, slug), weights:product_weights(label, price)"
    )
    .eq("is_active", true)
    .in("slug", FEATURED_SLUGS);

  return <Index initialFeatured={data ?? []} />;
}
