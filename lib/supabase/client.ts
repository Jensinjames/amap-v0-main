/**
 * Browser-only singleton Supabase client.
 *
 * Exports
 * ──────────────────────────────────────────────────────────────
 * • getBrowserClient – function that always returns the same client
 * • supabase         – pre-created instance (named export)
 * • default          – same instance (default export)
 */
import { createBrowserClient } from "@supabase/ssr"

let _client: ReturnType<typeof createBrowserClient> | undefined

export function getBrowserClient() {
  if (!_client) {
    _client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return _client
}

/* Named + default exports expected by the rest of the codebase */
export const supabase = getBrowserClient()
export default supabase
