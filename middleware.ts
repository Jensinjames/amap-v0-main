import { updateSession } from "@/lib/supabase/middleware"

export const middleware = updateSession

// Run on every route except for static assets.
export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
}
