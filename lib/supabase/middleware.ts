import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/ssr"

export async function updateSession(request: NextRequest) {
  // Ensure the user’s session cookie is kept up-to-date on every request.
  const response = NextResponse.next()

  const supabase = createMiddlewareClient({
    req: request,
    res: response,
  })

  await supabase.auth.getSession()
  return response
}
