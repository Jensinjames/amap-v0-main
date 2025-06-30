/**
 * Browser-side singleton Supabase client
 * (prevents "Multiple GoTrueClient instances" warning)
 */
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required")
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
