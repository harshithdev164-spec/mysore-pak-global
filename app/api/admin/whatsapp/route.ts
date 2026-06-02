export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET /api/admin/whatsapp                 → list distinct conversations (most recent first)
// GET /api/admin/whatsapp?wa_id=91...     → message log for one customer
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wa_id = searchParams.get("wa_id")?.trim();
  const supabase = createAdminClient();

  if (wa_id) {
    const { data, error } = await supabase
      .from("wa_messages")
      .select("id, direction, msg_type, body, created_at")
      .eq("wa_id", wa_id)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  }

  // Conversation list — most recent message per wa_id with the body preview.
  // We can't easily do a DISTINCT ON without RPC, so fetch recent 500 and reduce.
  const { data, error } = await supabase
    .from("wa_messages")
    .select("wa_id, direction, body, msg_type, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byWaId = new Map<string, {
    wa_id: string;
    last_body: string | null;
    last_direction: string;
    last_at: string;
    message_count: number;
  }>();
  for (const row of data ?? []) {
    const r = row as {
      wa_id: string; direction: string; body: string | null;
      msg_type: string; created_at: string;
    };
    const prev = byWaId.get(r.wa_id);
    if (!prev) {
      byWaId.set(r.wa_id, {
        wa_id: r.wa_id,
        last_body: r.body,
        last_direction: r.direction,
        last_at: r.created_at,
        message_count: 1,
      });
    } else {
      prev.message_count += 1;
    }
  }

  return NextResponse.json({ data: Array.from(byWaId.values()) });
}
