export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  isSupportedCountry,
  validatePostalCode,
  calculateStaticRates,
} from "@/lib/countries";

// GET /api/shipping/intl-rates?country=US&postal_code=10001&weight_kg=0.5&value_inr=899
//
// Returns BOTH courier options (Delhivery + DHL) so the customer can pick at checkout:
//   {
//     data: [
//       { courier_company_id: 1,   courier_name: "Delhivery",  rate: 3950, etd: "7-10" },
//       { courier_company_id: 100, courier_name: "DHL Express", rate: 4500, etd: "5-7" }
//     ]
//   }
//
// Rates come from the static zone table in src/lib/countries.ts. Live rate APIs
// (DHL India PostQuote_RAS, Delhivery international) can be wired in later when
// each courier's account-side configuration is finalized — the static table
// keeps the calculator working today.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") ?? "").toUpperCase().trim();
  const postal = (searchParams.get("postal_code") ?? "").trim();
  const weight = Math.max(parseFloat(searchParams.get("weight_kg") ?? "0.5"), 0.5);

  if (!country || !isSupportedCountry(country)) {
    return NextResponse.json(
      { error: "Country not supported for international shipping" },
      { status: 400 }
    );
  }

  if (!postal || !validatePostalCode(postal, country)) {
    return NextResponse.json(
      { error: `Invalid postal code for ${country}` },
      { status: 400 }
    );
  }

  const data = calculateStaticRates(country, weight);
  if (data.length === 0) {
    return NextResponse.json(
      { error: "Shipping unavailable to this destination" },
      { status: 502 }
    );
  }

  return NextResponse.json({ data });
}
