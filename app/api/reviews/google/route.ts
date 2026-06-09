export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { fetchGooglePlace, isPlacesConfigured } from "@/lib/google-places";

// 24h in-memory cache. Google Places API charges per request, and reviews
// don't change minute-to-minute. One refresh per day per warm Lambda is
// effectively free under the $200/month credit.
let CACHE: { at: number; data: unknown } | null = null;
const TTL_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  if (!isPlacesConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        place: null,
        note:
          "Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID env vars to enable real reviews.",
      },
      { status: 200, headers: { "Cache-Control": "public, max-age=300" } }
    );
  }

  if (CACHE && Date.now() - CACHE.at < TTL_MS) {
    return NextResponse.json(
      { configured: true, place: CACHE.data, cached: true },
      { status: 200, headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }

  const place = await fetchGooglePlace();
  if (!place) {
    // API call failed — return the previous cache if any, else null.
    if (CACHE) {
      return NextResponse.json(
        { configured: true, place: CACHE.data, stale: true },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { configured: true, place: null, error: "Failed to fetch place details." },
      { status: 502 }
    );
  }

  CACHE = { at: Date.now(), data: place };
  return NextResponse.json(
    { configured: true, place, cached: false },
    { status: 200, headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
