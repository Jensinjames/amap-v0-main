import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars")
}

/**
 * A SINGLE browser-side Supabase client.
 * The module system ensures it is instantiated only once.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
