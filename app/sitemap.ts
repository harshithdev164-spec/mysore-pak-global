import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.worldofmysorepak.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,              lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/shop`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/our-story`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/franchise`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/careers`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/tour-guide`,    lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/tour-guide/map`,lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
  ];

  const supabase = createServerClient();

  const [{ data: products }, { data: places }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, created_at")
      .eq("is_active", true),
    supabase
      .from("places")
      .select("id, created_at")
      .eq("is_active", true),
  ]);

  const productRoutes: MetadataRoute.Sitemap = (products ?? [])
    .filter((p: { slug: string | null }) => !!p.slug)
    .map((p: { slug: string; created_at: string | null }) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const placeRoutes: MetadataRoute.Sitemap = (places ?? []).map(
    (pl: { id: string; created_at: string | null }) => ({
      url: `${SITE_URL}/tour-guide/place/${pl.id}`,
      lastModified: pl.created_at ? new Date(pl.created_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  return [...staticRoutes, ...productRoutes, ...placeRoutes];
}
