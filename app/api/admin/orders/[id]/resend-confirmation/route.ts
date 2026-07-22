export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/emails/send-order-confirmation";

// POST /api/admin/orders/[id]/resend-confirmation
//
// Admin-triggered resend of the order confirmation email. `force: true`
// bypasses the confirmation_email_sent_at dedup so support can help a
// customer who says they didn't get the first email. Auth is enforced by
// the admin middleware over all /api/admin/* routes.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

  const result = await sendOrderConfirmation(id, { force: true });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? result.skipped ?? "Failed to send" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    request_id: result.request_id,
    resent_at: new Date().toISOString(),
  });
}
