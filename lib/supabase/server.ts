import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

/**
 * Call this helper **inside server actions / route handlers / RSCs only**.
 * It returns a per-request Supabase client with the request cookies attached.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies, headers })
}
