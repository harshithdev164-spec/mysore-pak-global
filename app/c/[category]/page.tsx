import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import CategoryLanding, { type CategoryConfig } from "@/components/CategoryLanding";
import type { Product } from "@/data/products";

export const revalidate = 60;

// Per-category landing page config — one entry per supported ad-campaign slug.
// Heroes, headlines and SEO copy live here so a marketer can iterate without
// touching layout code. Add a new entry to launch a new landing page.
const CATEGORIES: Record<string, CategoryConfig & { metaTitle: string; metaDescription: string }> = {
  "mysore-pak": {
    slug: "mysore-pak",
    name: "Mysore Pak",
    eyebrow: "Since 1935 — Pride of Karnataka",
    headline: "The Original Mysore Pak. Made in Mysuru.",
    subline:
      "A royal kitchen recipe, slow-cooked in copper kadhais and pure A2 cow ghee. Soft, melt-in-mouth, and shipped fresh across India.",
    heroImage: "/mysoree paak.png",
    metaTitle: "Buy Mysore Pak Online - Original Mysuru Recipe",
    metaDescription:
      "Buy authentic Mysore Pak online, slow-cooked in copper with pure ghee from the original 1935 Mysuru Palace recipe. Pan-India delivery in 5-7 days.",
  },
  "ghee-sweets": {
    slug: "ghee-sweets",
    name: "Ghee Sweets",
    eyebrow: "Hand-stirred in copper",
    headline: "Pure Ghee Sweets. Made the Slow Way.",
    subline:
      "Laddoos, burfis, halwa — crafted in small batches with aged A2 cow ghee and unrefined sugar. No vanaspati, no shortcuts.",
    heroImage: "/ghee-sweets.webp",
    metaTitle: "Ghee Sweets Online - Pure Mysuru Sweets",
    metaDescription:
      "Buy pure ghee sweets online from World of Mysore Pak, made with traditional Mysuru recipes, fresh batches, gift boxes and pan-India delivery.",
  },
  namkeens: {
    slug: "namkeens",
    name: "Namkeens",
    eyebrow: "Crispy & freshly fried",
    headline: "Mysuru's Crispy Savouries.",
    subline:
      "Khara, om pudi, mixture, masala sevai — fried fresh in small batches every morning and packed the same day for maximum crunch.",
    heroImage: "/Namkeen.webp",
    metaTitle: "Buy Namkeens Online - Mysuru Crispy Snacks",
    metaDescription:
      "Buy crispy namkeens online from World of Mysore Pak, crafted with authentic Mysuru flavours, fresh batches and pan-India delivery.",
  },
  chocolates: {
    slug: "chocolates",
    name: "Chocolates",
    eyebrow: "Indian flavours, European craft",
    headline: "Where Chocolate Meets Ghee.",
    subline:
      "Chocolate bars and bites blending fine cocoa with our ghee-rich traditions. A modern twist on Mysuru&apos;s sweet legacy.",
    heroImage: "/chocolates.webp",
    metaTitle: "Buy Chocolates Online - Mysuru Sweet Gifts",
    metaDescription:
      "Shop chocolates online from World of Mysore Pak, along with fresh Mysuru sweets, gift boxes and pan-India delivery for every sweet celebration.",
  },
  "gift-boxes": {
    slug: "gift-boxes",
    name: "Gift Boxes",
    eyebrow: "For every celebration",
    headline: "Gifts That Arrive Remembered.",
    subline:
      "Festival hampers, wedding favours, corporate Diwali boxes. Premium packaging, custom branding, hand-curated assortments.",
    heroImage: "/Gift Boxes.webp",
    metaTitle: "Buy Sweet Gift Boxes Online - Mysuru Hampers",
    metaDescription:
      "Curated gift hampers from World of Mysore Pak — festival boxes, wedding favours and corporate Diwali gifting with premium packaging and pan-India delivery.",
  },
};

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cfg = CATEGORIES[params.category];
  if (!cfg) return { title: "Category Not Found", robots: { index: false, follow: false } };
  const path = `/c/${cfg.slug}`;
  const canonical = `https://www.worldofmysorepak.com${path}`;
  return {
    title: cfg.metaTitle,
    description: cfg.metaDescription,
    alternates: { canonical: path },
    // Paid-ad landing pages — keep them out of Google's index so they don't
    // compete with /shop?category=... for organic clicks. Direct URL access
    // (from an ad click or shared link) still works exactly the same.
    robots: { index: false, follow: false },
    openGraph: {
      title: cfg.metaTitle,
      description: cfg.metaDescription,
      url: canonical,
      type: "website",
      images: [{ url: cfg.heroImage }],
    },
  };
}

export default async function CategoryLandingPage({
  params,
}: {
  params: { category: string };
}) {
  const cfg = CATEGORIES[params.category];
  if (!cfg) notFound();

  const supabase = createServerClient();

  // Resolve the category id first, then fetch every active product in it.
  // No limit — the landing page shows the full collection right under the
  // hero so ad visitors don't have to click through to /shop.
  const { data: catRow } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", cfg.slug)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryId = (catRow as any)?.id as string | undefined;

  const { data: rows } = categoryId
    ? await supabase
        .from("products")
        .select(`
          id, name, slug, base_price, original_price, image, badge, rating, review_count,
          category:categories(id, name, slug),
          weights:product_weights(id, label, price, stock_quantity)
        `)
        .eq("is_active", true)
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })
    : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: Product[] = (rows ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    originalPrice: p.original_price ?? undefined,
    category: p.category?.name ?? "",
    description: "",
    ingredients: "",
    storage: "",
    weights: (p.weights ?? []).map((w: { id: string; label: string; price: number; stock_quantity?: number }) => ({
      id: w.id,
      label: w.label,
      price: w.price,
      stock_quantity: w.stock_quantity ?? 100,
    })),
    image: p.image ?? "",
    badge: p.badge ?? undefined,
    rating: p.rating ?? 0,
    reviews: p.review_count ?? 0,
  }));

  return <CategoryLanding config={cfg} products={products} />;
}
