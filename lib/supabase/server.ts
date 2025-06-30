import { cookies } from "next/headers"
import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Environment variables are required for every invocation.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

/**
 * Returns a brand-new Supabase client for the current server request and
 * transparently keeps auth cookies in sync.
 */
export function createClient(): SupabaseClient {
  const cookieStore = cookies()

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          /* ignore — called from a Server Component */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch {
          /* ignore — called from a Server Component */
        }
      },
    },
  })
}

/* -------------------------------------------------------------------------- */
/*  Backward compatibility: allow `createServerClient` import as well.        */
/* -------------------------------------------------------------------------- */
export { createClient as createServerClient }
