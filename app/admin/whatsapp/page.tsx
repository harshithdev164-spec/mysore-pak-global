"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface Conversation {
  wa_id: string;
  last_body: string | null;
  last_direction: string;
  last_at: string;
  message_count: number;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  msg_type: string;
  body: string | null;
  created_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AdminWhatsAppPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);

  // Poll conversations every 15s
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/whatsapp", { cache: "no-store" });
        const j = await r.json();
        if (!cancelled) setConvos(j.data ?? []);
      } catch { /* keep prior list */ }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    const t = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  // Load thread when active changes
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoadingThread(true);
    fetch(`/api/admin/whatsapp?wa_id=${encodeURIComponent(active)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setMessages(j.data ?? []); })
      .finally(() => { if (!cancelled) setLoadingThread(false); });
    const t = setInterval(() => {
      fetch(`/api/admin/whatsapp?wa_id=${encodeURIComponent(active)}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => { if (!cancelled) setMessages(j.data ?? []); });
    }, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, [active]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Conversations</h1>
        <p className="text-sm text-gray-500 mt-1">Live message log from customers messaging your business number.</p>
      </div>

      <div className="flex-1 flex bg-white rounded-xl border border-gray-200 overflow-hidden min-h-0">
        {/* Left — conversation list */}
        <aside className="w-72 border-r border-gray-200 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {convos.length} conversation{convos.length === 1 ? "" : "s"}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && convos.length === 0 && (
              <p className="text-sm text-gray-400 p-4">Loading…</p>
            )}
            {!loading && convos.length === 0 && (
              <p className="text-sm text-gray-400 p-4">
                No conversations yet. They&apos;ll appear here as customers message your WhatsApp business number.
              </p>
            )}
            {convos.map((c) => (
              <button
                key={c.wa_id}
                onClick={() => setActive(c.wa_id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  active === c.wa_id ? "bg-amber-50 border-l-2 border-l-amber-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-sm text-gray-900">+{c.wa_id}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(c.last_at)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {c.last_direction === "outbound" ? "↳ " : ""}{c.last_body ?? "(no text)"}
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* Right — thread */}
        <main className="flex-1 flex flex-col min-h-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">+{active}</div>
                  <div className="text-xs text-gray-500">
                    {messages.length} message{messages.length === 1 ? "" : "s"}
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
                {loadingThread && messages.length === 0 && (
                  <p className="text-sm text-gray-400 text-center">Loading messages…</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.direction === "outbound"
                          ? "bg-amber-500 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.body || `(${m.msg_type})`}</div>
                      <div
                        className={`text-[10px] mt-1 ${
                          m.direction === "outbound" ? "text-amber-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-gray-100 bg-white">
                <p className="text-[11px] text-gray-400">
                  Read-only view. To reply, message from the WhatsApp Business app on your phone — replies will appear here on next refresh.
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
