"use server"

import { createClient } from "@/lib/supabase/server"
import { getBrowserClient } from "@/lib/supabase/client"

export async function sendPasswordResetEmail(email: string) {
  // This function can be called from the client, but the reset email is sent by Supabase server-side.
  // We use the browser client here to initiate the request.
  const supabase = getBrowserClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/auth/update-password`,
  })
  if (error) {
    console.error("Error sending password reset email:", error)
    throw new Error(error.message)
  }
  return true
}

export async function updateUserPassword(newPassword: string) {
  // This must be a server action because it requires an authenticated session
  // to update the user's password.
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    console.error("Error updating user password:", error)
    throw new Error(error.message)
  }
  return true
}
