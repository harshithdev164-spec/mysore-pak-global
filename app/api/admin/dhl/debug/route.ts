export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDhlRate, getLastDhlExchange, isDhlConfigured } from "@/lib/dhl";

// GET /api/admin/dhl/debug?country=US&postal_code=10001&weight_kg=0.5&value_inr=899
//
// Runs a single PostQuote against the DHL India SOAP service and returns the
// FULL exchange (request envelope, response status, response body) so we can
// see exactly what DHL is returning. Use this to diagnose 'no rate' issues.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") ?? "US").toUpperCase();
  const postal = searchParams.get("postal_code") ?? "10001";
  const weight = Math.max(0.5, parseFloat(searchParams.get("weight_kg") ?? "0.5"));
  const valueInr = Math.max(1, parseFloat(searchParams.get("value_inr") ?? "899"));

  const env = {
    DHL_API_BASE_URL: process.env.DHL_API_BASE_URL ?? "(default)",
    DHL_SITE_ID: process.env.DHL_SITE_ID ? "set" : "MISSING",
    DHL_PASSWORD: process.env.DHL_PASSWORD ? "set" : "MISSING",
    DHL_ACCOUNT_NUMBER: process.env.DHL_ACCOUNT_NUMBER ? "set" : "MISSING",
    DHL_PICKUP_POSTAL_CODE: process.env.DHL_PICKUP_POSTAL_CODE ?? "(default 570011)",
    DHL_PICKUP_CITY: process.env.DHL_PICKUP_CITY ?? "(default Mysuru)",
    configured: isDhlConfigured(),
  };

  let parsed: unknown = null;
  let error: string | null = null;
  try {
    parsed = await getDhlRate({
      destination_country: country,
      destination_postal_code: postal,
      weight_kg: weight,
      declared_value_inr: valueInr,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const exchange = getLastDhlExchange();

  return NextResponse.json({
    env,
    input: { country, postal, weight, valueInr },
    parsed,
    error,
    exchange,
  });
}
