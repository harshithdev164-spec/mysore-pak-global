export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { normalizePhone, verifyOtpCode } from "@/lib/admin-otp";
import {
  ADMIN_COOKIE,
  createAdminSession,
  SESSION_TTL_REMEMBER_S,
  SESSION_TTL_STANDARD_S,
} from "@/lib/admin-auth";
import type { AdminRole } from "@/lib/admin-permissions";

// POST /api/admin/auth/verify-otp
// Body: { phone, code, remember? }
//
// On success: sets the admin session cookie, returns { ok, role }.
// On failure: 401 with a generic message so we don't leak "wrong code"
// vs "code expired" vs "phone not registered".
export async function POST(request: Request) {
  let body: { phone?: string; code?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const code = (body.code ?? "").trim();
  const remember = !!body.remember;

  if (!phone || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter a valid 6-digit code." }, { status: 400 });
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Admin auth not configured on server." }, { status: 503 });
  }

  const supabase = createAdminClient();

  // Get the most recent unused, unexpired OTP for this phone.
  const nowIso = new Date().toISOString();
  const { data: otpRow, error: fetchErr } = await supabase
    .from("admin_otp_codes")
    .select("id, code_hash, expires_at, attempts, used_at")
    .eq("phone", phone)
    .is("used_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchErr || !otpRow) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = otpRow as any;
  if ((row.attempts ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Too many attempts on this code. Request a new one." },
      { status: 429 }
    );
  }

  // Bump attempts first — that way a wrong guess still counts even if the
  // response times out on the client side.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("admin_otp_codes") as any)
    .update({ attempts: (row.attempts ?? 0) + 1 })
    .eq("id", row.id);

  const matches = await verifyOtpCode(code, row.code_hash);
  if (!matches) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  // Load the admin user record for the phone
  const { data: user } = await supabase
    .from("admin_users")
    .select("id, name, role, is_active")
    .eq("phone", phone)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any;
  if (!u || !u.is_active) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  // Mark the OTP consumed so it can't be replayed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("admin_otp_codes") as any)
    .update({ used_at: nowIso })
    .eq("id", row.id);

  // Update last_login_at (best-effort)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("admin_users") as any)
    .update({ last_login_at: nowIso })
    .eq("id", u.id);

  // Issue the session cookie
  const ttl = remember ? SESSION_TTL_REMEMBER_S : SESSION_TTL_STANDARD_S;
  const session = await createAdminSession(secret, {
    sub: u.id,
    role: u.role as AdminRole,
    name: u.name,
    ttlSeconds: ttl,
  });

  const res = NextResponse.json({ ok: true, role: u.role, name: u.name });
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: session,
    httpOnly: true,
    sameSite: "lax",
    maxAge: ttl,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
