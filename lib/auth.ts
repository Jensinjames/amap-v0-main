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
    console.error(error)
    return redirect("/auth/signup?message=Could not create user")
  }

  return redirect("/auth/signup?message=Check email to continue sign up process")
}

export async function sendPasswordResetEmail(email: string) {
  const origin = headers().get("origin")
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/update-password`,
  })

  if (error) {
    throw error
  }

  return { success: true }
}

export async function updateUserPassword(newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    throw error
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect("/")
}
