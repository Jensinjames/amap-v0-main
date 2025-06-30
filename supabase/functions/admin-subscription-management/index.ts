// Supabase Edge Function for admin subscription management
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"
import { Deno } from "https://deno.land/std@0.168.0/io/mod.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

interface SubscriptionAction {
  action: "create_plan" | "update_plan" | "delete_plan" | "assign_plan" | "cancel_subscription"
  data: any
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

    const { action, data }: SubscriptionAction = await req.json()

    let result: any = {}

    switch (action) {
      case "create_plan":
        result = await createSubscriptionPlan(stripe, supabaseClient, data, adminUser.id)
        break

      case "update_plan":
        result = await updateSubscriptionPlan(stripe, supabaseClient, data, adminUser.id)
        break

      case "delete_plan":
        result = await deleteSubscriptionPlan(stripe, supabaseClient, data, adminUser.id)
        break

      case "assign_plan":
        result = await assignPlanToUser(stripe, supabaseClient, data, adminUser.id)
        break

      case "cancel_subscription":
        result = await cancelUserSubscription(stripe, supabaseClient, data, adminUser.id)
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
    console.error("Admin subscription action error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function createSubscriptionPlan(stripe: any, supabaseClient: any, data: any, adminId: string) {
  const { name, description, price, credits, seats, features, isActive } = data

  // Create Stripe product
  const product = await stripe.products.create({
    name: name,
    description: description,
    metadata: {
      credits: credits.toString(),
      seats: seats.toString(),
    },
  })

  // Create Stripe price
  const stripePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: price * 100, // Convert to cents
    currency: "usd",
    recurring: {
      interval: "month",
    },
    metadata: {
      plan_name: name.toLowerCase(),
    },
  })

  // Store plan in database
  const { data: planData, error } = await supabaseClient
    .from("subscription_plans")
    .insert({
      name: name,
      description: description,
      price: price,
      credits: credits,
      seats: seats,
      features: features,
      is_active: isActive,
      stripe_product_id: product.id,
      stripe_price_id: stripePrice.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error("Failed to create plan in database")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    action: "plan_created",
    details: { plan_id: planData.id, stripe_product_id: product.id },
  })

  return { success: true, plan: planData, stripeProductId: product.id }
}

async function updateSubscriptionPlan(stripe: any, supabaseClient: any, data: any, adminId: string) {
  const { planId, name, description, price, credits, seats, features, isActive } = data

  // Get existing plan
  const { data: existingPlan, error: fetchError } = await supabaseClient
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single()

  if (fetchError) {
    throw new Error("Plan not found")
  }

  // Update Stripe product
  await stripe.products.update(existingPlan.stripe_product_id, {
    name: name,
    description: description,
    metadata: {
      credits: credits.toString(),
      seats: seats.toString(),
    },
  })

  // Create new price if price changed
  let newPriceId = existingPlan.stripe_price_id
  if (price !== existingPlan.price) {
    const newPrice = await stripe.prices.create({
      product: existingPlan.stripe_product_id,
      unit_amount: price * 100,
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan_name: name.toLowerCase(),
      },
    })
    newPriceId = newPrice.id

    // Archive old price
    await stripe.prices.update(existingPlan.stripe_price_id, {
      active: false,
    })
  }

  // Update plan in database
  const { error: updateError } = await supabaseClient
    .from("subscription_plans")
    .update({
      name: name,
      description: description,
      price: price,
      credits: credits,
      seats: seats,
      features: features,
      is_active: isActive,
      stripe_price_id: newPriceId,
    })
    .eq("id", planId)

  if (updateError) {
    throw new Error("Failed to update plan in database")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    action: "plan_updated",
    details: { plan_id: planId, changes: data },
  })

  return { success: true, planId }
}

async function deleteSubscriptionPlan(stripe: any, supabaseClient: any, data: any, adminId: string) {
  const { planId } = data

  // Get existing plan
  const { data: existingPlan, error: fetchError } = await supabaseClient
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single()

  if (fetchError) {
    throw new Error("Plan not found")
  }

  // Check if plan has active subscriptions
  const { data: activeSubscriptions, error: subsError } = await supabaseClient
    .from("user_plans")
    .select("id")
    .eq("plan_name", existingPlan.name.toLowerCase())
    .eq("status", "active")

  if (subsError) {
    throw new Error("Failed to check active subscriptions")
  }

  if (activeSubscriptions && activeSubscriptions.length > 0) {
    throw new Error("Cannot delete plan with active subscriptions")
  }

  // Archive Stripe product and price
  await stripe.products.update(existingPlan.stripe_product_id, {
    active: false,
  })

  await stripe.prices.update(existingPlan.stripe_price_id, {
    active: false,
  })

  // Soft delete plan in database
  const { error: deleteError } = await supabaseClient
    .from("subscription_plans")
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq("id", planId)

  if (deleteError) {
    throw new Error("Failed to delete plan")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    action: "plan_deleted",
    details: { plan_id: planId, stripe_product_id: existingPlan.stripe_product_id },
  })

  return { success: true }
}

async function assignPlanToUser(stripe: any, supabaseClient: any, data: any, adminId: string) {
  const { userId, planName, reason } = data

  // Get plan details
  const planDetails = {
    starter: { credits: 50, seats: 1 },
    growth: { credits: 200, seats: 5 },
    scale: { credits: 500, seats: 15 },
  }

  const planConfig = planDetails[planName as keyof typeof planDetails]
  if (!planConfig) {
    throw new Error("Invalid plan")
  }

  // Update user plan
  const { error: planError } = await supabaseClient
    .from("user_plans")
    .update({
      plan_name: planName,
      credits_limit: planConfig.credits,
      seat_count: planConfig.seats,
      status: "active",
    })
    .eq("user_id", userId)

  if (planError) {
    throw new Error("Failed to assign plan")
  }

  // Update user credits
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
    action: "plan_assigned",
    details: { user_id: userId, plan_name: planName, reason },
  })

  return { success: true, assignedPlan: planName }
}

async function cancelUserSubscription(stripe: any, supabaseClient: any, data: any, adminId: string) {
  const { userId, reason } = data

  // Get user's subscription
  const { data: userPlan, error: planError } = await supabaseClient
    .from("user_plans")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (planError) {
    throw new Error("User plan not found")
  }

  // Cancel Stripe subscription if exists
  if (userPlan.stripe_subscription_id) {
    await stripe.subscriptions.cancel(userPlan.stripe_subscription_id)
  }

  // Update user plan status
  const { error: updateError } = await supabaseClient
    .from("user_plans")
    .update({ status: "canceled" })
    .eq("user_id", userId)

  if (updateError) {
    throw new Error("Failed to cancel subscription")
  }

  // Log the action
  await logAdminAction(supabaseClient, {
    admin_user_id: adminId,
    action: "subscription_canceled",
    details: { user_id: userId, reason, stripe_subscription_id: userPlan.stripe_subscription_id },
  })

  return { success: true }
}

async function logAdminAction(supabaseClient: any, actionData: any) {
  await supabaseClient.from("admin_audit_log").insert({
    ...actionData,
    timestamp: new Date().toISOString(),
  })
}
