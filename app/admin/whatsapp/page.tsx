"use client";

import { useEffect, useRef, useState } from "react";

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

// WhatsApp Business 24-hour customer-service window — free-text only allowed
// inside this since the customer's last inbound message.
const WINDOW_MS = 24 * 60 * 60 * 1000;
function windowStatus(lastInboundAt: string | null): {
  open: boolean;
  msLeft: number;
  label: string;
} {
  if (!lastInboundAt) {
    return { open: false, msLeft: 0, label: "no inbound yet — only template messages will deliver" };
  }
  const ms = WINDOW_MS - (Date.now() - new Date(lastInboundAt).getTime());
  if (ms <= 0) {
    return { open: false, msLeft: 0, label: "24-hour window closed — only template messages will deliver" };
  }
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return { open: true, msLeft: ms, label: `${h}h ${m}m left in 24h reply window` };
}

export default function AdminWhatsAppPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastInboundAt, setLastInboundAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Poll conversations every 15s
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/whatsapp", { cache: "no-store" });
        const j = await r.json();
        if (!cancelled) setConvos(j.data ?? []);
      } catch {
        /* keep prior list */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // Load thread when active changes + poll every 10s
  useEffect(() => {
    if (!active) {
      setMessages([]);
      setLastInboundAt(null);
      return;
    }
    let cancelled = false;
    setLoadingThread(true);
    const fetchThread = async () => {
      try {
        const r = await fetch(`/api/admin/whatsapp?wa_id=${encodeURIComponent(active)}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!cancelled) {
          setMessages(j.data ?? []);
          setLastInboundAt(j.last_inbound_at ?? null);
        }
      } catch {
        /* swallow */
      } finally {
        if (!cancelled) setLoadingThread(false);
      }
    };
    fetchThread();
    const t = setInterval(fetchThread, 10000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [active]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const ws = windowStatus(lastInboundAt);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wa_id: active, text }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError(j.error || `Send failed (${res.status})`);
        return;
      }
      setDraft("");
      // Optimistic refresh — the wa_messages insert from sendWhatsAppText
      // is already done by the time the response returns, so the next
      // /api/admin/whatsapp?wa_id=... call will include it.
      const r = await fetch(`/api/admin/whatsapp?wa_id=${encodeURIComponent(active)}`, {
        cache: "no-store",
      });
      const fresh = await r.json();
      setMessages(fresh.data ?? []);
      setLastInboundAt(fresh.last_inbound_at ?? null);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Conversations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reply to customers directly. Free-text replies only deliver inside the 24-hour service window after their last message.
        </p>
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
                  {c.last_direction === "outbound" ? "↳ " : ""}
                  {c.last_body ?? "(no text)"}
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
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {messages.length} message{messages.length === 1 ? "" : "s"}
                    <span className="text-gray-300">·</span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        ws.open ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ws.open ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {ws.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
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
                          ? "bg-emerald-500 text-white rounded-br-sm"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {m.body || `(${m.msg_type})`}
                      </div>
                      <div
                        className={`text-[10px] mt-1 ${
                          m.direction === "outbound" ? "text-emerald-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSend}
                className="px-4 py-3 border-t border-gray-100 bg-white"
              >
                {!ws.open && (
                  <div className="mb-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    ⚠ {ws.label}. Meta will reject free-text replies until the customer messages again.
                  </div>
                )}
                {sendError && (
                  <div className="mb-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                    {sendError}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder={`Reply to +${active}…  (⌘/Ctrl+Enter to send)`}
                    rows={2}
                    maxLength={4096}
                    className="flex-1 resize-y min-h-[44px] max-h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                  <span>{draft.length}/4096</span>
                  <span>Replies are logged in the thread once Meta confirms delivery.</span>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
