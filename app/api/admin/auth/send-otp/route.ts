export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { generateOtpCode, hashOtpCode, normalizePhone } from "@/lib/admin-otp";
import { sendAdminOtpTemplate } from "@/lib/whatsapp-templates";

// POST /api/admin/auth/send-otp
// Body: { phone: string }
//
// Rate limits (enforced here, not RLS):
//   - Max 3 OTPs per phone per 15 minutes
//   - OTP valid for 5 minutes
//
// Returns 200 for BOTH "OTP sent" and "phone not registered" cases — we
// never leak which phones are admins. The UI just proceeds to the code-
// entry screen unconditionally. If the phone isn't an admin, verify-otp
// will 401.
export async function POST(request: Request) {
  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Rate-limit: how many OTP rows created for this phone in the last 15 min?
  const fifteenMinAgo = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from("admin_otp_codes")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("id", { count: "exact", head: true } as any)
    .eq("phone", phone)
    .gte("created_at", fifteenMinAgo);

  if ((recentCount ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Too many code requests. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  // Only send if the phone belongs to an active admin. But return 200 even
  // if not, to avoid leaking who is registered.
  const { data: user } = await supabase
    .from("admin_users")
    .select("id, name, is_active")
    .eq("phone", phone)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive = !!(user && (user as any).is_active);

  if (isActive) {
    const code = generateOtpCode();
    const code_hash = await hashOtpCode(code);
    const expires_at = new Date(Date.now() + 5 * 60_000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insErr } = await (supabase.from("admin_otp_codes") as any).insert({
      phone, code_hash, expires_at,
    });
    if (insErr) {
      console.error("[admin/send-otp] insert failed", insErr);
      return NextResponse.json({ error: "Could not send OTP. Try again." }, { status: 500 });
    }

    const send = await sendAdminOtpTemplate({ to: phone, code });
    if (!send.ok) {
      console.error("[admin/send-otp] whatsapp send failed", send.error);
      return NextResponse.json(
        { error: "Couldn't deliver the code via WhatsApp. Try again in a minute." },
        { status: 502 }
      );
    }
  } else {
    // Phone isn't a registered admin. Sleep briefly to blur timing.
    await new Promise((r) => setTimeout(r, 250));
  }

  return NextResponse.json({ ok: true, expires_in: 300 });
}
