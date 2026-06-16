export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  sendWhatsAppText,
  isWhatsAppConfigured,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

// POST /api/admin/whatsapp/send
// Body: { wa_id: "919538772164", text: "Hi there" }
//
// Admin-side reply from /admin/whatsapp. sendWhatsAppText already logs
// the outbound message to wa_messages, so the thread view will pick it
// up on its next poll without any extra writes here.
//
// Meta enforces a 24-hour customer-service window for free-text replies
// (after the customer's last inbound message). Outside that window only
// pre-approved template messages are deliverable. The UI warns the admin
// before they send, and Meta's 400/403 will surface as the error here.
export async function POST(request: Request) {
  if (!isWhatsAppConfigured()) {
    return NextResponse.json(
      { error: "WhatsApp not configured (WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN)" },
      { status: 503 }
    );
  }

  let body: { wa_id?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const waIdRaw = (body.wa_id ?? "").trim();
  const text = (body.text ?? "").trim();

  if (!waIdRaw) {
    return NextResponse.json({ error: "wa_id is required" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }
  if (text.length > 4096) {
    return NextResponse.json(
      { error: "Message too long (max 4096 chars per WhatsApp limit)" },
      { status: 400 }
    );
  }

  const wa_id = normalizeWhatsAppNumber(waIdRaw);
  if (!wa_id || wa_id.length < 10) {
    return NextResponse.json({ error: "Invalid recipient number" }, { status: 400 });
  }

  try {
    const result = await sendWhatsAppText(wa_id, text);
    if (!result.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errBody = result.body as any;
      const metaErr = errBody?.error?.message || JSON.stringify(errBody).slice(0, 300);
      return NextResponse.json(
        { error: `Meta rejected the message: ${metaErr}`, status: result.status, body: errBody },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, wa_id, sent_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 }
    );
  }
}
