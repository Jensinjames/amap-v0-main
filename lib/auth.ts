import { supabase } from "./supabase"

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) throw error

  // Create user profile and initial plan
  if (data.user) {
    await createUserProfile(data.user.id, email, firstName, lastName)
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

const createUserProfile = async (userId: string, email: string, firstName: string, lastName: string) => {
  // Create user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName,
  })

  if (profileError) throw profileError

  // Create initial plan (starter with trial)
  const { error: planError } = await supabase.from("user_plans").insert({
    user_id: userId,
    plan_name: "starter",
    credits_limit: 50,
    seat_count: 1,
    status: "trialing",
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  })

  if (planError) throw planError

  // Create initial credits
  const { error: creditsError } = await supabase.from("user_credits").insert({
    user_id: userId,
    monthly_limit: 50,
    credits_used: 0,
  })

  if (creditsError) throw creditsError
}
