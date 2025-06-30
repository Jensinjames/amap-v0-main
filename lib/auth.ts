/**
 * Minimal auth helpers needed by the UI.
 * Both functions are exported by *name* to satisfy the build.
 */
import { supabase } from "./supabase/client"

/**
 * Send a password-reset email to a user.
 */
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  })
  if (error) throw error
  return true
}

/**
 * Update the logged-in user’s password after they followed the reset link.
 */
export async function updateUserPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return true
}
