import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

/**
 * Refreshes the user session cookie on every request.
 * Called from `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  /* This response will be returned (possibly mutated) */
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  /* If a session exists this will rotate / refresh the JWT if needed */
  await supabase.auth.getSession()

  return response
}
