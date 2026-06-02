export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSession,
  passwordsMatch,
} from "@/lib/admin-auth";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    console.error("[admin login] ADMIN_PASSWORD or ADMIN_SESSION_SECRET not set");
    return NextResponse.json(
      { error: "Admin auth not configured on server" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provided = body?.password ?? "";
  if (!passwordsMatch(provided, adminPassword)) {
    // Small constant delay slows brute-force at zero UX cost.
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createAdminSession(sessionSecret, SESSION_TTL_SECONDS);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
