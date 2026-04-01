export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";
import { deleteCached } from "@/lib/redis";

// GET /api/categories/:id
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image, description")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

// PUT /api/categories/:id — admin
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await deleteCached("categories:list");
  return NextResponse.json({ data });
}

// DELETE /api/categories/:id — admin
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await deleteCached("categories:list");
  return NextResponse.json({ success: true });
}
