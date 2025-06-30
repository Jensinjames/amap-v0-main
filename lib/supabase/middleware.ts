import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/ssr"

/**
 * Refreshes the user session on every request so that Server Components have
 * an up-to-date cookie / auth state.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createMiddlewareClient({
    req: request,
    res: response,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })

  /* If the user has a session, this ensures it gets refreshed (rotation). */
  await supabase.auth.getSession()

  return response
}
