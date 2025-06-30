import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnon) {
  throw new Error("Supabase env vars are missing")
}

/**
 * Singleton browser Supabase client.
 * Prevents “Multiple GoTrueClient instances detected” warning.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnon)
