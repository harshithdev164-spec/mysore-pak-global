export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";

// GET /api/categories
export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image, description")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/categories — create a new category (admin)
export async function POST(request: Request) {
  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, error } = await supabase.from("categories").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
