import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

/**
 * Returns a fresh Supabase client for each server request.
 * Keeps cookies in sync so the user session persists.
 */
export function createSupabaseServerClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies().set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookies().delete({ name, ...options })
      },
    },
  })
}
