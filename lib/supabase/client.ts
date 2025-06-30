"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Returns a singleton browser Supabase client.
 * Prevents “Multiple GoTrueClient instances detected” warnings
 * during Hot-Module-Replacement / Fast Refresh.
 */
let browserClient: SupabaseClient | undefined

export function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set")
  }

  browserClient = createBrowserClient(url, anon)
  return browserClient
}

/* Named + default export for convenience throughout the app */
export const supabase = getBrowserClient()
export default supabase
