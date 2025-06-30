"use client"

/**
 * Singleton Supabase browser client.
 * Guarantees only ONE GoTrueClient instance in the browser,
 * preventing the “Multiple GoTrueClient instances detected” warning.
 */
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | undefined

export function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error("Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.")
  }

  browserClient = createBrowserClient(url, anon)
  return browserClient
}

/**
 * Convenience singleton export so the rest of the codebase can:
 *   import { supabase } from "@/lib/supabase/client"
 */
export const supabase = getBrowserClient()

/* default export for modules that do `import supabase from ...` */
export default supabase
