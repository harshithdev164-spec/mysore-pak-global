export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/whatsapp";
import { routeIncomingMessage } from "@/lib/whatsapp-bot";

// ──────────────────────────────────────────────
// GET — webhook verification (Meta sends this once during setup)
//
// Meta requests:  ?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=YYY
// We must echo `hub.challenge` as plain text if verify_token matches.
// ──────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expected) {
    return new Response("Verify token not configured", { status: 503 });
  }

  if (mode === "subscribe" && token === expected && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return new Response("Forbidden", { status: 403 });
}

// ──────────────────────────────────────────────
// POST — incoming events from WhatsApp Cloud API
//
// Payload shape (truncated):
// {
//   "object": "whatsapp_business_account",
//   "entry": [{
//     "id": "<WABA id>",
//     "changes": [{
//       "field": "messages",
//       "value": {
//         "messaging_product": "whatsapp",
//         "metadata": { "phone_number_id": "..." },
//         "contacts": [{ "profile": { "name": "..." }, "wa_id": "919876543210" }],
//         "messages": [
//           { "from": "919876543210", "id": "wamid....", "type": "text",
//             "text": { "body": "hello" } }
//         ]
//       }
//     }]
//   }]
// }
// ──────────────────────────────────────────────
export async function POST(request: Request) {
  const raw = await request.text();
  const sig = request.headers.get("x-hub-signature-256");

  // Skip signature check only if APP_SECRET unset (dev / local). In prod
  // missing APP_SECRET means signed-but-unverifiable — always 401.
  if (process.env.WHATSAPP_APP_SECRET) {
    if (!verifyWebhookSignature(raw, sig)) {
      console.error("[whatsapp] signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error("[whatsapp] WHATSAPP_APP_SECRET missing in production");
    return NextResponse.json({ error: "Signature secret not configured" }, { status: 503 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Always return 200 fast — Meta retries aggressively on non-200 responses.
  // Do the actual work after we've decided we can. Errors in routing are logged.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: any[] = payload?.entry ?? [];
    for (const entry of entries) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const changes: any[] = entry?.changes ?? [];
      for (const change of changes) {
        if (change?.field !== "messages") continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages: any[] = change?.value?.messages ?? [];
        for (const m of messages) {
          if (!m?.from) continue;

          // Text message
          if (m.type === "text" && m.text?.body) {
            await routeIncomingMessage({ from: m.from, text: m.text.body });
            continue;
          }

          // Interactive reply (button click)
          if (m.type === "interactive") {
            const btn = m.interactive?.button_reply;
            const list = m.interactive?.list_reply;
            const reply = btn ?? list;
            if (reply?.id) {
              await routeIncomingMessage({
                from: m.from,
                text: reply.title ?? "",
                buttonId: reply.id,
              });
              continue;
            }
          }

          // Anything else (image, location, etc.) → handoff
          await routeIncomingMessage({
            from: m.from,
            text: `(non-text message: ${m.type})`,
          });
        }
      }
    }
  } catch (err) {
    console.error("[whatsapp] route failed:", err);
    // still ack
  }

  return NextResponse.json({ ok: true });
}
