// ── Role → route allowlist ────────────────────────────────────────────────
//
// Single source of truth for what each admin role can see. Consumed by:
//   - middleware.ts    — server-side route protection (redirects on mismatch)
//   - app/admin/layout.tsx — client-side sidebar filter
//
// Adding a new admin route? Add its path prefix to the roles that should
// have access. Anything not listed here is Super-Admin-only by default.

export type AdminRole = "super_admin" | "admin" | "finance" | "logistics";

/**
 * Route prefixes each role is allowed to reach. A URL matches if its
 * pathname starts with any of the prefixes below. Order doesn't matter.
 * "/admin" alone (exact) is the dashboard — everyone gets it.
 */
export const ROLE_ROUTES: Record<AdminRole, readonly string[]> = {
  super_admin: [
    "/admin", // catches everything under /admin/*
  ],
  admin: [
    "/admin",
    "/admin/orders",
    "/admin/invoices",
    "/admin/products",
    "/admin/categories",
    "/admin/explore",
    "/admin/whatsapp",
    "/admin/franchise-leads",
    // Explicitly NOT in list: /admin/finance, /admin/team
  ],
  finance: [
    "/admin",
    "/admin/orders",     // read-only enforced at page level, not middleware
    "/admin/invoices",
    "/admin/finance",
  ],
  logistics: [
    "/admin",
    "/admin/orders",
    "/admin/products",
  ],
};

/**
 * Human-readable role label — shown next to the user's name in the sidebar.
 */
export const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  finance: "Finance",
  logistics: "Logistics",
};

/**
 * Returns true if the given role is allowed to view the given path.
 * Super Admin passes everything. Everyone else must match a prefix, with
 * more-specific prefixes winning over less-specific ones (so /admin/finance
 * doesn't leak in for a role that only has /admin).
 */
export function canAccess(role: AdminRole, pathname: string): boolean {
  if (role === "super_admin") return true;

  // Find the *longest* matching prefix across ALL roles. If that longest
  // prefix belongs to a role this user isn't in, they're blocked.
  //
  // Example: pathname = "/admin/finance/reports"
  //   - "/admin" matches (5 chars) — allowed for all
  //   - "/admin/finance" matches (14 chars) — allowed only for super/finance
  //   Longest wins → block admin/logistics.
  let longestMatch = "";
  let allowedForThisRole = false;

  for (const r of Object.keys(ROLE_ROUTES) as AdminRole[]) {
    for (const prefix of ROLE_ROUTES[r]) {
      if (matchesPrefix(pathname, prefix) && prefix.length > longestMatch.length) {
        longestMatch = prefix;
        allowedForThisRole = ROLE_ROUTES[role].includes(prefix);
      }
    }
  }

  return allowedForThisRole;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (pathname === prefix) return true;
  return pathname.startsWith(prefix + "/");
}
