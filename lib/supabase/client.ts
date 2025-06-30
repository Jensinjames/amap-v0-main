"use client"

import { createBrowserClient } from "@supabase/ssr"

declare global {
  // Ensures the client is stored on the global object to prevent multiple instances
  // in Fast Refresh / Hot-Module-Replacement scenarios.
  // eslint-disable-next-line no-var
  var __supabase__: ReturnType<typeof createBrowserClient> | undefined
}

/**
 * Returns a singleton browser Supabase client.
 * The same instance is reused across the entire client bundle,
 * preventing “Multiple GoTrueClient instances detected” warnings.
 */
export function getBrowserClient() {
  if (!globalThis.__supabase__) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    }

    globalThis.__supabase__ = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
  }
  return globalThis.__supabase__
}

export const supabase = getBrowserClient()

// default export for convenience
export default supabase
