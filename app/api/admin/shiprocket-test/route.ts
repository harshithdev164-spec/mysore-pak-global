export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { deleteCached } from "@/lib/redis";

// GET /api/admin/shiprocket-test — diagnose Shiprocket auth + list pickup locations
export async function GET() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

  if (!email || !password) {
    return NextResponse.json({ error: "SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not set" });
  }

  // Clear any cached backoff + stale token so this test always tries fresh
  await deleteCached("shiprocket:auth_backoff", "shiprocket:token");

  try {
    // Step 1: Authenticate
    const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const authText = await authRes.text();
    let authParsed: Record<string, unknown>;
    try { authParsed = JSON.parse(authText); } catch { authParsed = { raw: authText }; }

    if (!authRes.ok || !authParsed.token) {
      return NextResponse.json({
        auth_status: authRes.status,
        auth_ok: false,
        email,
        pickupPincode,
        pickupLocation,
        auth_response: authParsed,
      });
    }

    const token = authParsed.token as string;

    // Step 2: Fetch pickup locations so we can verify the name matches
    const pickupRes = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pickupText = await pickupRes.text();
    let pickupParsed: unknown;
    try { pickupParsed = JSON.parse(pickupText); } catch { pickupParsed = pickupText; }

    return NextResponse.json({
      auth_status: authRes.status,
      auth_ok: true,
      email,
      pickupLocation_env: pickupLocation,
      pickupPincode_env: pickupPincode,
      pickup_locations: pickupParsed,
    });
  } catch (err) {
    return NextResponse.json({
      error: "Fetch threw an exception",
      message: err instanceof Error ? err.message : String(err),
      email,
    });
  }
}
