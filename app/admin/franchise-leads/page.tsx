"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string | null;
  status: "new" | "contacted" | "converted" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TABS: { label: string; value: "all" | Lead["status"] }[] = [
  { label: "All",         value: "all" },
  { label: "New",         value: "new" },
  { label: "Contacted",   value: "contacted" },
  { label: "Converted",   value: "converted" },
  { label: "Rejected",    value: "rejected" },
];

const STATUS_COLORS: Record<Lead["status"], string> = {
  new:       "bg-yellow-100 text-yellow-800 border-yellow-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  converted: "bg-green-100 text-green-800 border-green-200",
  rejected:  "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AdminFranchiseLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | Lead["status"]>("all");
  const [search, setSearch] = useState("");

  async function reload(filter: "all" | Lead["status"] = tab) {
    setLoading(true);
    try {
      const qs = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/franchise-leads${qs}`, { cache: "no-store" });
      const j = await res.json();
      setLeads(j.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(tab); }, [tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.phone, l.city, l.message ?? ""].some((f) => f.toLowerCase().includes(q))
    );
  }, [leads, search]);

  // Counts by status for the tab pills
  const counts = useMemo(() => {
    const c: Record<Lead["status"] | "all", number> = { all: 0, new: 0, contacted: 0, converted: 0, rejected: 0 };
    // When a specific tab is active the counts reflect only that filter's rows;
    // that's fine — the "All" tab shows totals when you switch to it.
    for (const l of leads) { c[l.status] += 1; c.all += 1; }
    return c;
  }, [leads]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchise Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Enquiries submitted through the /franchise page.</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, city…"
          className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
        />
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((t) => {
          const isActive = tab === t.value;
          const n = counts[t.value] ?? 0;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[10px] ${isActive ? "text-amber-100" : "text-gray-400"}`}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && leads.length === 0 ? (
          <p className="text-sm text-gray-400 p-12 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-12 text-center">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{l.name}</div>
                      {l.message && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">
                          {l.message}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-gray-700">{l.email}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{l.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{l.city}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[l.status]}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(l.created_at).toLocaleTimeString("en-IN", {
                          hour: "numeric", minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/franchise-leads/${l.id}`}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 uppercase tracking-wider"
                      >
                        View →
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
