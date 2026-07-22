"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ROLE_LABEL, type AdminRole } from "@/lib/admin-permissions";

interface TeamMember {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

const ROLES: AdminRole[] = ["super_admin", "admin", "finance", "logistics"];

export default function EditAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ name: string; email: string; role: AdminRole; is_active: boolean }>({
    name: "", email: "", role: "logistics", is_active: true,
  });
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    // Team list already fetched by parent — do a single-user look-up via GET /admin/team then filter
    fetch("/api/admin/team", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const m = (j.data ?? []).find((x: TeamMember) => x.id === id);
        if (m) {
          setMember(m);
          setForm({ name: m.name, email: m.email ?? "", role: m.role, is_active: m.is_active });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    if (!member) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setMsg({ kind: "err", text: j.error ?? "Save failed" });
        return;
      }
      setMember({ ...member, ...j.data });
      setMsg({ kind: "ok", text: "Saved." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!member) return;
    const ok = confirm(`Delete ${member.name} from the team? This can't be undone.`);
    if (!ok) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as { error?: string }));
        setMsg({ kind: "err", text: j.error ?? "Delete failed" });
        return;
      }
      router.replace("/admin/team");
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Delete failed" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;
  if (!member) return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Admin not found.</p>
      <Link href="/admin/team" className="text-xs font-semibold text-amber-700">← Back to team</Link>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/team" className="text-xs font-semibold text-gray-500 hover:text-gray-800 uppercase tracking-wider">
            ← Team
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{member.name}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">+{member.phone}</p>
        </div>
        <button
          onClick={remove}
          disabled={saving}
          className="px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 uppercase tracking-wider"
        >
          Delete
        </button>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</label>
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

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 rounded accent-amber-600"
          />
          <span className="text-sm text-gray-700">Active — can sign in and see admin panels</span>
        </label>

        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <Link href="/admin/team" className="text-sm text-gray-500 hover:text-gray-800">Cancel</Link>
        </div>

        {msg && (
          <p className={`text-xs ${msg.kind === "ok" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-red-700 bg-red-50 border-red-100"} border rounded-md px-3 py-2`}>
            {msg.text}
          </p>
        )}

        <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
          <div>Added: {new Date(member.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
          <div>Last login: {member.last_login_at ? new Date(member.last_login_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never"}</div>
        </div>
      </div>
    </div>
  );
}
