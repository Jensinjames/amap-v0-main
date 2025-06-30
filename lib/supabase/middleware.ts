import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

/**
 * Keeps the Supabase session cookie fresh on every request.
 * MUST be called from Next.js middleware.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => response.cookies.set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) => response.cookies.delete({ name, ...options }),
      },
    },
  )

  // Refresh user if the JWT is close to expiring
  await supabase.auth.getSession()
  return response
}
