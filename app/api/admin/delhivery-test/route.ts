export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// GET /api/admin/delhivery-test — diagnose Delhivery auth
export async function GET() {
  const token = process.env.DELHIVERY_TOKEN;
  const pickupPincode = process.env.DELHIVERY_PICKUP_PINCODE;
  const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION;

  if (!token) {
    return NextResponse.json({ error: "DELHIVERY_TOKEN not set" });
  }

  try {
    // Delhivery doesn't have a simple /me endpoint, but we can query the tariff api 
    // with a dummy pincode check to verify valid token
    const res = await fetch(`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&d_pin=560001&o_pin=560001&wt=500`, {
      headers: { 
        Authorization: `Token ${token}`,
        "Content-Type": "application/json"
      },
    });

    const isOk = res.ok;
    let authParsed: unknown;
    try { 
      authParsed = await res.json(); 
    } catch { 
      authParsed = { raw: await res.text() }; 
    }

    return NextResponse.json({
      auth_status: res.status,
      auth_ok: isOk,
      pickupLocation_env: pickupLocation,
      pickupPincode_env: pickupPincode,
      delhivery_response: authParsed,
    });
  } catch (err) {
    return NextResponse.json({
      error: "Fetch threw an exception",
      message: err instanceof Error ? err.message : String(err)
    });
  }
}
