import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client for API routes (respects RLS)
export const createServerClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);

// Admin client — uses service role key to bypass RLS for all admin operations.
// Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase dashboard → Settings → API → service_role key).
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
