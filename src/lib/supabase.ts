import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Fallback placeholders prevent createClient from throwing during the Next.js
// build phase when env vars aren't injected yet. The real values are always
// present at runtime (request time) via Vercel env vars.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client for API routes (respects RLS)
export const createServerClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role key to bypass RLS for all admin operations.
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    // During Next.js build phase env vars may be absent — fall back gracefully.
    // At request time in production this should never happen; log loudly so it's
    // immediately visible in Vercel function logs.
    console.error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set! " +
        "Admin operations will use the anon key and may fail due to RLS. " +
        "Add this env var in Vercel → Project Settings → Environment Variables."
    );
  }
  return createClient(supabaseUrl, serviceKey ?? supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export const IMAGE_BUCKET = 'places-image';

export function getImageUrl(placeId: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${placeId}.jpg?t=${Date.now()}`;
}

export interface PlaceDetail {
  id: string;
  name: string;
  description: string;
  entry_fee: string;
  best_time: string;
  time_needed: string;
  rating: number;
  tip: string;
  hours: string | null;
  image_url: string;
  category: string;
  lat: number;
  lng: number;
}

export async function fetchPlaceDetail(id: string): Promise<PlaceDetail | null> {
  const { data, error } = await (supabase as any)
    .from('places')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as PlaceDetail;
}

