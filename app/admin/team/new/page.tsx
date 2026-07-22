"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROLE_LABEL, type AdminRole } from "@/lib/admin-permissions";

const ROLES: AdminRole[] = ["super_admin", "admin", "finance", "logistics"];

export default function NewAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    role: "logistics" as AdminRole,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(j.error ?? `Failed (${res.status})`);
        return;
      }
      router.replace("/admin/team");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/team" className="text-xs font-semibold text-gray-500 hover:text-gray-800 uppercase tracking-wider">
        ← Team
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2">Add admin</h1>
      <p className="text-sm text-gray-500 mt-1">
        The person will sign in on <code>/admin/login</code> using this phone number and a
        WhatsApp OTP.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Full name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ravi Kumar"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              WhatsApp phone *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="98xxxxxxxx"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Email (optional)
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="ravi@example.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Role *
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.role === r ? "border-amber-500 bg-amber-50" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={form.role === r}
                  onChange={() => setForm({ ...form, role: r })}
                  className="accent-amber-600"
                />
                <span className="text-sm font-semibold text-gray-700">{ROLE_LABEL[r]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving ? "Adding…" : "Add admin"}
          </button>
          <Link href="/admin/team" className="text-sm text-gray-500 hover:text-gray-800">Cancel</Link>
        </div>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
