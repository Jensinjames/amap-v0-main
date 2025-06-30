"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect("/auth/signin?message=Could not authenticate user")
  }

  return redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect("/auth/signup?message=Could not create user")
  }

  return redirect("/auth/signup?message=Check email to continue sign up process")
}

export async function requestPasswordReset(formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/update-password`,
  })

  if (error) {
    return redirect("/auth/forgot-password?message=Could not send reset link")
  }

  return redirect("/auth/forgot-password?message=Password reset link has been sent")
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect("/auth/update-password?message=Could not update password")
  }

  return redirect("/dashboard")
}
