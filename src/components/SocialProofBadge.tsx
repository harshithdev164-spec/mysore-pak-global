"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  productSlug: string;
  /** Deprecated — kept for API compatibility with server pages that still
   *  pass it. The old "sold in last 30 days" pill was removed on 2026-07-11. */
  soldLast30d?: number;
}

// Live "N viewing this now" badge — driven by Supabase Realtime presence.
// Every visitor to /products/<slug> joins the channel `product-viewers:<slug>`
// with an anonymous visitor id; the count is the presence-state key count.
// Hidden while resolving so we don't flash a misleading "1".
export default function SocialProofBadge({ productSlug }: Props) {
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    // Stable-per-tab visitor id so refresh doesn't double-count.
    let visitorId = "";
    try {
      visitorId = sessionStorage.getItem("wmp_visitor_id") ?? "";
    } catch { /* private mode */ }
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      try { sessionStorage.setItem("wmp_visitor_id", visitorId); } catch { /* ignore */ }
    }

    const channel = supabase.channel(`product-viewers:${productSlug}`, {
      config: { presence: { key: visitorId } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setViewers(Object.keys(state).length);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ at: new Date().toISOString() });
      }
    });

    return () => {
      // Untrack + unsubscribe so this visitor leaves the presence set
      // immediately when they navigate away, dropping the live count.
      channel.untrack().finally(() => supabase.removeChannel(channel));
    };
  }, [productSlug]);

  if (viewers === null || viewers < 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-body text-[11px] font-bold uppercase tracking-wider">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Eye className="h-3.5 w-3.5" />
        {viewers === 1
          ? "You're viewing now"
          : `${viewers.toLocaleString("en-IN")} viewing now`}
      </span>
    </div>
  );
}
