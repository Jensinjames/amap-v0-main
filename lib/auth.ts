"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Sends a password-reset email that points to /auth/update-password
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  })
  if (error) throw error
  return { success: true }
}

/**
 * Updates the currently authenticated user’s password.
 * (User is signed in automatically by Supabase after following
 * the reset-password link.)
 */
export async function updateUserPassword(newPassword: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return { success: true }
}
