import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for use in API routes and server components
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Types for our database tables
export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserPlan {
  id: string
  user_id: string
  plan_name: "starter" | "growth" | "scale"
  credits_limit: number
  seat_count: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: "active" | "canceled" | "past_due" | "trialing"
  trial_ends_at?: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface UserCredits {
  id: string
  user_id: string
  monthly_limit: number
  credits_used: number
  reset_at: string
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  user_id: string
  content_type: "email" | "ad" | "landing" | "social" | "blog" | "funnel"
  title: string
  prompt: string
  generated_content: any
  credits_used: number
  status: "generating" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: "owner" | "admin" | "member"
  status: "active" | "pending" | "inactive"
  invited_by?: string
  invited_at: string
  joined_at?: string
  created_at: string
  updated_at: string
}

export interface IntegrationToken {
  id: string
  user_id: string
  provider: "zapier" | "n8n" | "mailchimp" | "airtable"
  token_data: any
  is_active: boolean
  created_at: string
  updated_at: string
}
