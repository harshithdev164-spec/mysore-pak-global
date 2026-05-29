export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /sitemap.xml
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? "worldofmysorepak.com"}`;

  const supabase = createServerClient();
  // fetch up to 2000 active products
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true)
    .limit(2000);

  // fallback to empty array on error
  const items = Array.isArray(products) ? products : [];

  const staticPages = [
    { path: "/", priority: "1.0", freq: "daily" },
    { path: "/products", priority: "0.9", freq: "daily" },
    { path: "/shop", priority: "0.8", freq: "daily" },
    { path: "/our-story", priority: "0.6", freq: "monthly" },
    { path: "/cart", priority: "0.3", freq: "never" },
    { path: "/checkout", priority: "0.3", freq: "never" },
    { path: "/sign-in", priority: "0.2", freq: "never" },
    { path: "/sign-up", priority: "0.2", freq: "never" },
  ];

  const urlEntries = [] as string[];

  const now = new Date().toISOString();

  for (const p of staticPages) {
    urlEntries.push(`
  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
  }

  for (const prod of items) {
    const slug = (prod as any).slug;
    if (!slug) continue;
    const lastmod = (prod as any).updated_at ? new Date((prod as any).updated_at).toISOString() : now;
    const loc = `${baseUrl}/products/${encodeURIComponent(slug)}`;
    urlEntries.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries.join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
