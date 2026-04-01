export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";
import { getCached, setCached, deleteCached, TTL } from "@/lib/redis";

const CACHE_KEY = "categories:list";

// GET /api/categories
export async function GET() {
  const cached = await getCached<unknown>(CACHE_KEY);
  if (cached) {
    return NextResponse.json({ data: cached }, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300", "X-Cache": "HIT" },
    });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image, description")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await setCached(CACHE_KEY, data, TTL.CATEGORIES);

  return NextResponse.json({ data }, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300", "X-Cache": "MISS" },
  });
}

// POST /api/categories — create a new category (admin)
export async function POST(request: Request) {
  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { data, error } = await supabase.from("categories").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await deleteCached(CACHE_KEY);
  return NextResponse.json({ data }, { status: 201 });
}
