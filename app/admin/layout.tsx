"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { canAccess, ROLE_LABEL, type AdminRole } from "@/lib/admin-permissions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "▦", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "◫", exact: false },
  { href: "/admin/invoices", label: "Invoices", icon: "▤", exact: false },
  { href: "/admin/products", label: "Products", icon: "◈", exact: false, exclude: "/admin/products/bulk-upload" },
  { href: "/admin/products/bulk-upload", label: "Bulk Upload", icon: "⇪", exact: true },
  { href: "/admin/categories", label: "Categories", icon: "◉", exact: false },
  { href: "/admin/explore", label: "Manage Discovery", icon: "🗺", exact: false },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "💬", exact: false },
  { href: "/admin/franchise-leads", label: "Franchise Leads", icon: "🤝", exact: false },
  { href: "/admin/finance", label: "Finance & GST", icon: "📊", exact: false },
  { href: "/admin/team", label: "Team", icon: "👥", exact: false },
];

interface Me {
  role: AdminRole;
  name: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  // Login + access-denied pages render standalone (no sidebar) so they're
  // reachable when signed out or role-blocked.
  const isStandalone = pathname === "/admin/login" || pathname === "/admin/access-denied";

  useEffect(() => {
    if (isStandalone) return;
    fetch("/api/admin/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setMe({ role: j.role, name: j.name }))
      .catch(() => {/* ignore — middleware will redirect */});
  }, [isStandalone]);

  if (isStandalone) return <>{children}</>;

  async function signOut() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="text-base font-bold text-amber-700 tracking-tight">WOMP Admin</div>
          {me && (
            <div className="mt-2">
              <div className="text-xs text-gray-800 font-medium truncate">{me.name}</div>
              <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                {ROLE_LABEL[me.role]}
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems
            // Filter by role. While `me` is still loading we render nothing —
            // avoids a flash of forbidden items on slow connections.
            .filter((item) => (me ? canAccess(me.role, item.href) : false))
            .map((item) => {
              const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href) && (!item.exclude || !pathname.startsWith(item.exclude));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-amber-50 text-amber-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 text-xs transition-colors"
          >
            ← Back to Store
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 text-xs transition-colors"
          >
            ⎋ Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
