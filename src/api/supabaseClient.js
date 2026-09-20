import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

function makeClient() {
  if (!hasSupabaseConfig) {
    console.error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in Vercel and redeploy."
    );
    return createClient("https://unavailable.supabase.co", "public-anon-key-unavailable", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = makeClient();
