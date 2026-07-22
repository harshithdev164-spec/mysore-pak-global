export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

interface Params {
  params: { id: string };
}

// GET /api/admin/franchise-leads/[id] — single lead detail
export async function GET(_req: Request, { params }: Params) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("franchise_leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

// PATCH /api/admin/franchise-leads/[id]
// Body: { status?, admin_notes? }
export async function PATCH(request: Request, { params }: Params) {
  let body: { status?: string; admin_notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!["new", "contacted", "converted", "rejected"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.admin_notes !== undefined) {
    patch.admin_notes = String(body.admin_notes).slice(0, 5000);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("franchise_leads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(patch as any)
    .eq("id", params.id)
    .select("id, status, admin_notes, updated_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/admin/franchise-leads/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("franchise_leads").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
