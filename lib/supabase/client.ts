"use client"

import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

/**
 * Singleton browser Supabase client.
 * Prevents "Multiple GoTrueClient instances detected" warning.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
