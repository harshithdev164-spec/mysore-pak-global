export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { checkServiceability } from "@/lib/delhivery";
import { calculateDtdcStaticRate, isDtdcConfigured } from "@/lib/dtdc";

// GET /api/shipping/rates?pincode=560001&weight=0.5
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = (searchParams.get("pincode") ?? "").trim();
  const weight = Math.max(parseFloat(searchParams.get("weight") ?? "0.5"), 0.1);

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
  }

  try {
    const rates = [];

    // For domestic checkout we only offer DTDC by default.
    // If DTDC isn't configured, fall back to Delhivery when available.
    const dtdcRate = calculateDtdcStaticRate(weight);
    if (isDtdcConfigured()) {
      rates.push({
        courier_company_id: 200,
        courier_name: "DTDC Express",
        rate: dtdcRate.rate_inr,
        etd: dtdcRate.etd_days,
      });
    } else if (process.env.DELHIVERY_TOKEN) {
      try {
        const delhiveryRates = await checkServiceability(pincode, weight);
        rates.push(...delhiveryRates);
      } catch (err) {
        console.error("[Delhivery] rates error:", err);
      }
      // Also show DTDC static rate even if not configured so admins can see option
      rates.push({
        courier_company_id: 200,
        courier_name: "DTDC Express",
        rate: dtdcRate.rate_inr,
        etd: dtdcRate.etd_days,
      });
    } else {
      // No shipping providers configured
    }

    if (rates.length === 0) {
      return NextResponse.json({ error: "Shipping service not configured" }, { status: 503 });
    }

    // Always sort by rate ascending so cheapest is first
    rates.sort((a, b) => a.rate - b.rate);

    return NextResponse.json({ data: rates });
  } catch (err) {
    console.error("[Shipping] rates error:", err);
    return NextResponse.json({ error: "Unable to fetch shipping rates" }, { status: 502 });
  }
}
