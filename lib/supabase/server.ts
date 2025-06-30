/**
 * Server-side helper.  Export *createClient* exactly as required by the build.
 */
import { cookies, headers } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required")
}

export function createClient() {
  return createServerClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
    headers,
    cookies,
  })
}
