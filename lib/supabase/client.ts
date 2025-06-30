"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase browser client.
 * Ensures we don’t create multiple GoTrueClient instances.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars")
  }

  _client = createBrowserClient(url, anon)
  return _client
}

/**
 * Named export expected by other modules / build checker.
 * Importing `supabase` is equivalent to calling `getSupabaseClient()`.
 */
export const supabase = getSupabaseClient()
