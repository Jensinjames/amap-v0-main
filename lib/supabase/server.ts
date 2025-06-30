/**
 * Factory for Server Component / Route Handler Supabase clients.
 *
 * Exports
 * ──────────────────────────────────────────────────────────────
 * • createClient       – named export requested by build script
 * • createServerClient – alias for backward compatibility
 */
import { cookies } from "next/headers"
import { createServerClient as _createServerClient, type CookieOptions } from "@supabase/ssr"

export function createClient() {
  const cookieStore = cookies()

  return _createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

/* Keep previous import style working */
export { createClient as createServerClient }
