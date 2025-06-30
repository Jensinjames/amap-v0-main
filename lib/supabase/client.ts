"use client"

import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This singleton is the ONLY Supabase instance used in the browser.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
