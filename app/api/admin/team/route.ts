export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { normalizePhone } from "@/lib/admin-otp";

// All /api/admin/team endpoints are super_admin only. We check the session
// role explicitly here (middleware already runs a route-allowlist check
// too, but that's belt-and-suspenders — we don't trust the middleware not
// to be misconfigured on a future refactor).
async function assertSuperAdmin(): Promise<Response | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(secret, token);
  const role = session?.role ?? "super_admin";
  if (role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// GET /api/admin/team — list all admins, newest first
export async function GET() {
  const forbid = await assertSuperAdmin();
  if (forbid) return forbid;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, phone, name, email, role, is_active, created_at, last_login_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

// POST /api/admin/team — create a new admin
// Body: { phone, name, email?, role }
export async function POST(request: Request) {
  const forbid = await assertSuperAdmin();
  if (forbid) return forbid;

  let body: { phone?: string; name?: string; email?: string; role?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const phone = normalizePhone(body.phone ?? "");
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim() || null;
  const role = body.role;

  if (!phone) return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  if (!name)  return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!role || !["super_admin","admin","finance","logistics"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("admin_users") as any)
    .insert({ phone, name, email, role })
    .select("id, phone, name, email, role, is_active")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That phone number is already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
