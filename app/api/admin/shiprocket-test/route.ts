export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// GET /api/admin/shiprocket-test — diagnose Shiprocket auth
export async function GET() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

  if (!email || !password) {
    return NextResponse.json({ error: "SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not set" });
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { parsed = text; }

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      email,
      pickupPincode,
      pickupLocation,
      response: parsed,
    });
  } catch (err) {
    return NextResponse.json({
      error: "Fetch threw an exception",
      message: err instanceof Error ? err.message : String(err),
      email,
      pickupPincode,
    });
  }
}
