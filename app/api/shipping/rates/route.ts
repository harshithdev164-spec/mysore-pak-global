export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { checkServiceability } from "@/lib/delhivery";

// GET /api/shipping/rates?pincode=560001&weight=0.5
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = (searchParams.get("pincode") ?? "").trim();
  const weight = Math.max(parseFloat(searchParams.get("weight") ?? "0.5"), 0.1);

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
  }

  if (!process.env.DELHIVERY_TOKEN) {
    return NextResponse.json({ error: "Shipping service not configured" }, { status: 503 });
  }

  try {
    const rates = await checkServiceability(pincode, weight);
    return NextResponse.json({ data: rates });
  } catch (err) {
    console.error("[Delhivery] rates error:", err);
    return NextResponse.json({ error: "Unable to fetch shipping rates" }, { status: 502 });
  }
}
