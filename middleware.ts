import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { canAccess, type AdminRole } from "@/lib/admin-permissions";

// Paths that bypass the admin gate (login page + OTP endpoints + logout +
// access-denied so a role-blocked user doesn't get bounced in a redirect loop).
const PUBLIC_ADMIN_PATHS = new Set<string>([
  "/admin/login",
  "/admin/access-denied",
  "/api/admin/auth/send-otp",
  "/api/admin/auth/verify-otp",
  "/api/admin/auth/logout",
  // Internal endpoints protected by shared secret, not admin session
  "/api/internal/run-post-payment-hooks",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    // Server misconfigured — fail closed for both pages and APIs.
    console.error("[middleware] ADMIN_SESSION_SECRET not set; denying admin access");
    if (isAdminApi) {
      return NextResponse.json(
        { error: "Admin auth not configured on server" },
        { status: 503 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("err", "config");
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(secret, token);

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access check. Legacy sessions (no role claim) are treated as
  // super_admin — protects existing admin sessions from being locked out on
  // the day this ships. New sessions always carry a role.
  const role = (session.role as AdminRole | undefined) ?? "super_admin";
  const pathToCheck = isAdminApi
    ? pathname.replace(/^\/api\/admin/, "/admin") // API routes map to their admin page paths
    : pathname;

  if (!canAccess(role, pathToCheck)) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/access-denied";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
