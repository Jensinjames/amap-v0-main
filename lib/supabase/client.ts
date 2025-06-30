/**
 * Browser-side Supabase client (singleton).
 * Avoids the “Multiple GoTrueClient instances detected” warning.
 */
"use client"

import { createBrowserClient } from "@supabase/ssr"

// Lazy-initialised singleton
let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined

function getBrowserClient() {
  if (!supabaseBrowserClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase environment variables are not set in NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY",
      )
    }

    supabaseBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
  }
  return supabaseBrowserClient
}

// Named AND default export (covers every import style used in the codebase)
export const supabase = getBrowserClient()
export default supabase
