/**
 * Google Places API (New v1) wrapper for fetching real Google Business
 * reviews. Uses the modern `places.googleapis.com/v1/places/{place_id}`
 * endpoint with a field mask so we only pay for the columns we render.
 *
 * Env:
 *   GOOGLE_PLACES_API_KEY   — from Google Cloud Console, Places API enabled
 *   GOOGLE_PLACE_ID         — your business listing's place id (e.g. "ChIJ...")
 *
 * Both are required at request time; if either is missing the wrapper
 * returns `null` so the homepage can gracefully fall back to a CTA.
 */

export interface GoogleReview {
  author: string;
  authorPhoto: string | null;
  rating: number; // 1-5
  text: string;
  relativeTime: string; // "2 weeks ago"
  publishedAt: string;  // ISO timestamp for sorting
  authorProfileUrl: string | null;
}

export interface GooglePlace {
  placeId: string;
  name: string;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
  reviews: GoogleReview[];
}

export function isPlacesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeNum(v: any): number | null {
  const n = typeof v === "number" ? v : v != null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function fetchGooglePlace(): Promise<GooglePlace | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  const fieldMask = [
    "id",
    "displayName",
    "rating",
    "userRatingCount",
    "googleMapsUri",
    "reviews",
  ].join(",");

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=${encodeURIComponent(fieldMask)}`;
  // Field mask actually goes in the header; this path-level query is ignored
  // by the new API but harmless. Header is the real signal.

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
    });
  } catch (err) {
    console.error("[google-places] network error:", err);
    return null;
  }

  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 400);
    console.error("[google-places] HTTP", res.status, body);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j: any = await res.json().catch(() => null);
  if (!j) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: GoogleReview[] = ((j.reviews ?? []) as any[]).map((r) => ({
    author: r?.authorAttribution?.displayName ?? "Anonymous",
    authorPhoto: r?.authorAttribution?.photoUri ?? null,
    rating: safeNum(r?.rating) ?? 5,
    text: (r?.text?.text ?? r?.originalText?.text ?? "").trim(),
    relativeTime: r?.relativePublishTimeDescription ?? "",
    publishedAt: r?.publishTime ?? "",
    authorProfileUrl: r?.authorAttribution?.uri ?? null,
  })).filter((r: GoogleReview) => r.text.length > 0);

  return {
    placeId,
    name: j?.displayName?.text ?? "World of Mysore Pak",
    rating: safeNum(j?.rating),
    userRatingCount: safeNum(j?.userRatingCount),
    googleMapsUri: j?.googleMapsUri ?? null,
    reviews,
  };
}
