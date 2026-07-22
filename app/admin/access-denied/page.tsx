"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AccessDeniedPage() {
  const router = useRouter();

  async function signOut() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Your role doesn&apos;t have permission to see that section. If you think this
          is wrong, ask a super admin to update your role from the Team page.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
          >
            Go to dashboard
          </Link>
          <button
            onClick={signOut}
            className="px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
