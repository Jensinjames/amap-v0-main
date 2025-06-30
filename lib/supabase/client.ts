import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Guard against missing env variables (will fail fast during build / runtime).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

/* -------------------------------------------------------------------------- */
/*  Singleton browser client to prevent “Multiple GoTrueClient instances”.    */
/* -------------------------------------------------------------------------- */
let browserClient: SupabaseClient | undefined

export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

/**
 * Named export used throughout the client components.
 */
export const supabase = getBrowserClient()

/* Default export for convenience: `import supabase from "@/lib/supabase/client"` */
export default supabase
