export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// GET /api/places — all active tour-guide places ordered by display_order.
// Optional: ?category=heritage|temple|nature|culture|food|adventure
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim().toLowerCase() ?? "";

  const supabase = createServerClient();
  let query = supabase
    .from("places")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data ?? [] });
}
