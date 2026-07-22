"use client";

import { useEffect, useState } from "react";
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

const ROLE_STYLES: Record<AdminRole, string> = {
  super_admin: "bg-purple-100 text-purple-800 border-purple-200",
  admin:       "bg-blue-100 text-blue-800 border-blue-200",
  finance:     "bg-green-100 text-green-800 border-green-200",
  logistics:   "bg-orange-100 text-orange-800 border-orange-200",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team", { cache: "no-store" });
      const j = await res.json();
      setMembers(j.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">
            Admins who can sign in with WhatsApp OTP. Only super admins can add or remove members.
          </p>
        </div>
        <Link
          href="/admin/team/new"
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
        >
          + Add admin
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && members.length === 0 ? (
          <p className="text-sm text-gray-400 p-12 text-center">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-400 p-12 text-center">No admins yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last login</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${!m.is_active ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{m.name}</div>
                      {m.email && <div className="text-xs text-gray-500 mt-0.5">{m.email}</div>}
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-700">+{m.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${ROLE_STYLES[m.role]}`}>
                        {ROLE_LABEL[m.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {m.is_active
                        ? <span className="text-emerald-700 text-xs font-semibold">● Active</span>
                        : <span className="text-gray-400 text-xs">○ Disabled</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {m.last_login_at
                        ? new Date(m.last_login_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "Never"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/team/${m.id}`}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 uppercase tracking-wider"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
