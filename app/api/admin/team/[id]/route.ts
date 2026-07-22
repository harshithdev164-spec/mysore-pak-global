export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

async function assertSuperAdmin(): Promise<{ userId: string } | Response> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(secret, token);
  const role = session?.role ?? "super_admin";
  if (role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return { userId: session?.sub ?? "" };
}

interface Params { params: { id: string } }

// PATCH /api/admin/team/[id]
// Body: { name?, email?, role?, is_active? }
export async function PATCH(request: Request, { params }: Params) {
  const guard = await assertSuperAdmin();
  if (guard instanceof Response) return guard;

  let body: { name?: string; email?: string; role?: string; is_active?: boolean };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const patch: Record<string, unknown> = {};
  if (body.name       !== undefined) patch.name = String(body.name).trim();
  if (body.email      !== undefined) patch.email = String(body.email).trim() || null;
  if (body.is_active  !== undefined) patch.is_active = !!body.is_active;
  if (body.role       !== undefined) {
    if (!["super_admin","admin","finance","logistics"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    patch.role = body.role;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Don't let a super_admin lock themselves out — block de-role or deactivate
  // on their own row.
  if (params.id === guard.userId) {
    if (patch.role !== undefined && patch.role !== "super_admin") {
      return NextResponse.json(
        { error: "You can't change your own role. Ask another super admin to do it." },
        { status: 400 }
      );
    }
    if (patch.is_active === false) {
      return NextResponse.json(
        { error: "You can't deactivate yourself." },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("admin_users") as any)
    .update(patch)
    .eq("id", params.id)
    .select("id, phone, name, email, role, is_active")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// DELETE /api/admin/team/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const guard = await assertSuperAdmin();
  if (guard instanceof Response) return guard;

  if (params.id === guard.userId) {
    return NextResponse.json({ error: "You can't delete yourself." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
