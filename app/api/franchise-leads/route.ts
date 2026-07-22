export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// POST /api/franchise-leads
// Body: { name, email, phone, city, message? }
//
// Public endpoint — no auth. Validation is deliberately loose (people submit
// mangled phone numbers all the time; that's OK, sales team will clean up).
// The only hard rules are: everything required present, and email must
// vaguely look like an email address.
export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const city = (body.city ?? "").trim();
  const message = (body.message ?? "").trim() || null;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please tell us your full name." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That doesn't look like a valid email." }, { status: 400 });
  }
  if (!phone || phone.replace(/\D/g, "").length < 6) {
    return NextResponse.json({ error: "Please share a working phone number." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ error: "Please tell us your city." }, { status: 400 });
  }
  if ((message ?? "").length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const user_agent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("franchise_leads") as any).insert({
    name,
    email,
    phone,
    city,
    message,
    user_agent,
    source: "franchise-page",
  });

  if (error) {
    console.error("[franchise-leads] insert failed", error);
    return NextResponse.json(
      { error: "Couldn't save your enquiry. Please email franchise@worldofmysorepak.com instead." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
