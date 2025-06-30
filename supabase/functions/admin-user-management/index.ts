// Supabase Edge Function for admin user management operations
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface AdminAction {
  action: "adjust_credits" | "change_plan" | "toggle_status" | "impersonate" | "update_user"
  userId: string
  data: any
  reason?: string
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const {
      data: { user: adminUser },
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""))

    if (!adminUser) {
      return new Response(JSON.stringify({ error: "Invalid admin token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if user has admin role (implement your admin role check here)
    const { data: adminProfile } = await supabaseClient
      .from("admin_users")
      .select("role")
      .eq("user_id", adminUser.id)
      .single()

    if (!adminProfile || adminProfile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { action, userId, data, reason }: AdminAction = await req.json()

    let result: any = {}

    switch (action) {
      case "adjust_credits":
        result = await adjustUserCredits(supabaseClient, userId, data, adminUser.id, reason)
        break

      case "change_plan":
        result = await changeUserPlan(supabaseClient, userId, data, adminUser.id, reason)
        break

      case "toggle_status":
        result = await toggleUserStatus(supabaseClient, userId, data, adminUser.id, reason)
        break

      case "update_user":
        result = await updateUserProfile(supabaseClient, userId, data, adminUser.id)
        break

      case "impersonate":
        result = await createImpersonationToken(supabaseClient, userId, adminUser.id)
        break

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Admin action error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function adjustUserCredits(supabaseClient: any, userId: string, data: any, adminId: string, reason?: string) {
  const { amount, type } = data

  // Get current credits
  const { data: currentCredits, error: creditsError } = await supabaseClient
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (creditsError) {
    throw new Error("Failed to fetch user credits")
  }

  // Calculate new credit amount
  const adjustment = type === "add" ? amount : -amount
  const newUsed = Math.max(0, currentCredits.credits_used + adjustment)

  // Update credits
  const { error: updateError } = await supabaseClient
    .from("user_credits")
    .update({ credits_used: newUsed })
    .eq("user_id", userId)

  if (updateError) {
    throw new Error("Failed to update credits")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    target_user_id: userId,
    action: "credit_adjustment",
    details: { amount: adjustment, reason, previous_used: currentCredits.credits_used, new_used: newUsed },
  })

  return { success: true, newCreditsUsed: newUsed }
}

async function changeUserPlan(supabaseClient: any, userId: string, data: any, adminId: string, reason?: string) {
  const { newPlan } = data

  // Get plan details
  const planDetails = {
    starter: { credits: 50, seats: 1 },
    growth: { credits: 200, seats: 5 },
    scale: { credits: 500, seats: 15 },
  }

  const planConfig = planDetails[newPlan as keyof typeof planDetails]
  if (!planConfig) {
    throw new Error("Invalid plan")
  }

  // Update user plan
  const { error: planError } = await supabaseClient
    .from("user_plans")
    .update({
      plan_name: newPlan,
      credits_limit: planConfig.credits,
      seat_count: planConfig.seats,
    })
    .eq("user_id", userId)

  if (planError) {
    throw new Error("Failed to update plan")
  }

  // Update user credits limit
  const { error: creditsError } = await supabaseClient
    .from("user_credits")
    .update({ monthly_limit: planConfig.credits })
    .eq("user_id", userId)

  if (creditsError) {
    throw new Error("Failed to update credit limit")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    target_user_id: userId,
    action: "plan_change",
    details: { new_plan: newPlan, reason },
  })

  return { success: true, newPlan }
}

async function toggleUserStatus(supabaseClient: any, userId: string, data: any, adminId: string, reason?: string) {
  const { status } = data

  // Update user status (you might need to add a status field to your users table)
  const { error } = await supabaseClient.from("users").update({ status }).eq("id", userId)

  if (error) {
    throw new Error("Failed to update user status")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    target_user_id: userId,
    action: "status_change",
    details: { new_status: status, reason },
  })

  return { success: true, newStatus: status }
}

async function updateUserProfile(supabaseClient: any, userId: string, data: any, adminId: string) {
  const { firstName, lastName, email } = data

  // Update user profile
  const { error } = await supabaseClient
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      email: email,
    })
    .eq("id", userId)

  if (error) {
    throw new Error("Failed to update user profile")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    target_user_id: userId,
    action: "profile_update",
    details: { updated_fields: { firstName, lastName, email } },
  })

  return { success: true }
}

async function createImpersonationToken(supabaseClient: any, userId: string, adminId: string) {
  // Create a secure impersonation token
  const impersonationToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store impersonation session
  const { error } = await supabaseClient.from("admin_impersonation_sessions").insert({
    admin_user_id: adminId,
    target_user_id: userId,
    token: impersonationToken,
    expires_at: expiresAt.toISOString(),
    is_active: true,
  })

  if (error) {
    throw new Error("Failed to create impersonation session")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    target_user_id: userId,
    action: "impersonation_start",
    details: { token: impersonationToken, expires_at: expiresAt },
  })

  return { success: true, impersonationToken, expiresAt }
}

async function logAdminAction(supabaseClient: any, actionData: any) {
  await supabaseClient.from("admin_audit_log").insert({
    ...actionData,
    timestamp: new Date().toISOString(),
  })
}
