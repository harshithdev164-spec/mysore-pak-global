import { Suspense } from "react";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import Shop from "@/views/Shop";

// Per-category SEO copy. Google sees the right title/description for
// /shop?category=ghee-sweets, /shop?category=namkeens, etc.
const CATEGORY_META: Record<string, { title: string; description: string; path: string }> = {
  "mysore-pak": {
    title: "Buy Mysore Pak Online - Pure Ghee Sweets",
    description:
      "Buy authentic Mysore Pak online, made with pure ghee and traditional Mysuru recipes. Explore sweets, gift boxes and pan-India delivery.",
    path: "/shop",
  },
  "ghee-sweets": {
    title: "Ghee Sweets Online - Pure Mysuru Sweets",
    description:
      "Buy pure ghee sweets online from World of Mysore Pak, made with traditional Mysuru recipes, fresh batches, gift boxes and pan-India delivery.",
    path: "/shop?category=ghee-sweets",
  },
  namkeens: {
    title: "Buy Namkeens Online - Mysuru Snacks",
    description:
      "Buy crispy namkeens online from World of Mysore Pak, crafted with authentic Mysuru flavours, fresh batches and pan-India delivery.",
    path: "/shop?category=namkeens",
  },
  chocolates: {
    title: "Buy Chocolates Online - Mysuru Sweet Gifts",
    description:
      "Shop chocolates online from World of Mysore Pak, along with fresh Mysuru sweets, gift boxes and pan-India delivery for every sweet celebration.",
    path: "/shop?category=chocolates",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string };
}): Promise<Metadata> {
  const cat = (searchParams?.category ?? "mysore-pak").toLowerCase();
  const meta = CATEGORY_META[cat] ?? CATEGORY_META["mysore-pak"];
  const canonical = `https://www.worldofmysorepak.com${meta.path}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.path },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
    },
  };
}

// Human-readable label for each category slug — used for JSON-LD breadcrumbs.
// Keep in sync with the visible label in SIDEBAR_CATEGORIES in src/views/Shop.tsx.
const CATEGORY_LABEL: Record<string, string> = {
  "mysore-pak": "Mysore Pak",
  "ghee-sweets": "Ghee Sweets",
  "gift-boxes": "Gift Boxes",
  namkeens: "Namkeens",
  chocolates: "Chocolates",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createServerClient();

  // Products query — try to include the editorial flag columns first. If the
  // add_product_flags migration hasn't been run yet, the flags don't exist
  // and the whole query fails, which would blank out the shop. Fall back to
  // the base column set in that case so the shop keeps working; filter
  // chips will just find no matches until the migration is run.
  const withFlagsSelect =
    "id, name, slug, base_price, original_price, image, badge, rating, review_count, is_bestseller, is_recommended, category:categories(id, name, slug), weights:product_weights(id, label, price, stock_quantity)";
  const baseSelect =
    "id, name, slug, base_price, original_price, image, badge, rating, review_count, category:categories(id, name, slug), weights:product_weights(id, label, price, stock_quantity)";

  // eslint-disable-next-line prefer-const
  let { data: productsData, error: productsError } = await supabase
    .from("products")
    .select(withFlagsSelect)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.warn("[shop] falling back — missing product columns:", productsError.message);
    const retry = await supabase
      .from("products")
      .select(baseSelect)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productsData = retry.data as any;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (productsData ?? []) as any[];

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image")
    .order("name");

  // BreadcrumbList JSON-LD — varies by ?category= so each category URL gets
  // its own SERP breadcrumb chip. Default /shop = Mysore Pak (Shop → Mysore Pak).
  const cat = (searchParams?.category ?? "mysore-pak").toLowerCase();
  const catLabel = CATEGORY_LABEL[cat] ?? "Mysore Pak";
  const showCategoryCrumb = cat !== "mysore-pak";
  const crumbs = [
    { name: "Home", item: "https://www.worldofmysorepak.com/" },
    {
      name: "Shop",
      item: showCategoryCrumb
        ? "https://www.worldofmysorepak.com/shop"
        : undefined,
    },
    ...(showCategoryCrumb
      ? [{ name: catLabel, item: undefined }]
      : []),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.item ? { item: c.item } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <Shop initialProducts={products} initialCategories={categories ?? []} />
      </Suspense>
    </>
  );
}
