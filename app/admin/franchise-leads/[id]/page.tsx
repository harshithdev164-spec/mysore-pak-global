"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  source: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

const STATUSES: { value: Lead["status"]; label: string; color: string }[] = [
  { value: "new",       label: "New",       color: "border-yellow-300 bg-yellow-50 text-yellow-900" },
  { value: "contacted", label: "Contacted", color: "border-blue-300 bg-blue-50 text-blue-900" },
  { value: "converted", label: "Converted", color: "border-green-300 bg-green-50 text-green-900" },
  { value: "rejected",  label: "Rejected",  color: "border-gray-300 bg-gray-50 text-gray-700" },
];

export default function AdminFranchiseLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Lead["status"]>("new");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/franchise-leads/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setLead(j.data);
          setNotes(j.data.admin_notes ?? "");
          setStatus(j.data.status ?? "new");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    if (!lead) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/franchise-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setMsg({ kind: "err", text: j.error ?? `Save failed (${res.status})` });
        return;
      }
      setMsg({ kind: "ok", text: "Saved." });
      setLead({ ...lead, status, admin_notes: notes, updated_at: new Date().toISOString() });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!lead) return;
    const ok = confirm(`Delete this lead from ${lead.name}? This can't be undone.`);
    if (!ok) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/franchise-leads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as { error?: string }));
        setMsg({ kind: "err", text: j.error ?? "Delete failed" });
        return;
      }
      router.replace("/admin/franchise-leads");
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Delete failed" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;
  if (!lead) return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Lead not found.</p>
      <Link href="/admin/franchise-leads" className="text-xs font-semibold text-amber-700">← Back to leads</Link>
    </div>
  );

  const dirty = notes !== (lead.admin_notes ?? "") || status !== lead.status;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/franchise-leads" className="text-xs font-semibold text-gray-500 hover:text-gray-800 uppercase tracking-wider">
            ← All Leads
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{lead.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submitted {new Date(lead.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            {lead.updated_at !== lead.created_at && (
              <> &middot; Last updated {new Date(lead.updated_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</>
            )}
          </p>
        </div>
        <button
          onClick={remove}
          disabled={saving}
          className="px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 uppercase tracking-wider"
        >
          Delete
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: applicant + message */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Applicant</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Full Name</div>
                <div className="text-gray-900 font-medium">{lead.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">City</div>
                <div className="text-gray-900 font-medium">{lead.city}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</div>
                <a href={`mailto:${lead.email}`} className="text-amber-700 hover:text-amber-900 font-medium break-all">
                  {lead.email}
                </a>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</div>
                <a href={`tel:${lead.phone}`} className="text-amber-700 hover:text-amber-900 font-medium">
                  {lead.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Message</h2>
            {lead.message ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{lead.message}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No message.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Internal notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Follow-up details, phone-call summary, next steps…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Only visible to admins. {notes.length}/5000</p>
          </div>
        </div>

        {/* Right: status + save */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors ${
                    status === s.value ? s.color : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.value}
                    checked={status === s.value}
                    onChange={() => setStatus(s.value)}
                    className="accent-amber-600"
                  />
                  <span className={`text-sm font-semibold ${status === s.value ? "" : "text-gray-700"}`}>
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="w-full px-4 py-3 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {msg && (
              <p className={`text-xs mt-3 text-center ${msg.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}>
                {msg.text}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-[11px] text-gray-500 space-y-1">
            <div>Source: <span className="text-gray-700">{lead.source}</span></div>
            {lead.user_agent && (
              <div>User agent: <span className="text-gray-700 break-all">{lead.user_agent}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
