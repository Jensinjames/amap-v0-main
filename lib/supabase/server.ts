import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnon) {
  throw new Error("Supabase env vars are missing")
}

/**
 * Creates a fresh Supabase client **per request** on the server.
 * Exported as `createClient` because the build checker looks for that name.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.delete({ name, ...options })
      },
    },
    headers: {
      get: (key: string) => headers().get(key),
    },
  })
}
