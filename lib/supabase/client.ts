"use client"

import { createClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Singleton browser Supabase client to avoid the
 * “Multiple GoTrueClient instances detected” warning.
 */
let browserClient: SupabaseClient | undefined

export function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.")
  }

  browserClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return browserClient
}

/**
 * Named + default export for convenience.
 */
export const supabase = getBrowserClient()
export default supabase
