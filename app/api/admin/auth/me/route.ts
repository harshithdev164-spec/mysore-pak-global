export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

// GET /api/admin/auth/me
// Returns the current admin session's role + name so the client-side
// sidebar can filter itself. 401 if not logged in.
export async function GET() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const token = cookies().get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(secret, token);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  return NextResponse.json({
    sub: session.sub ?? null,
    role: session.role ?? "super_admin",
    name: session.name ?? "Admin",
    exp: session.exp,
  });
}
