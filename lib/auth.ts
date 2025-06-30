import { createClient } from "./supabase/server"

/**
 * Sends a password-reset link via Supabase.
 * The link redirects to /auth/update-password when the user clicks it.
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  })

  if (error) throw error
}

/**
 * Updates the user’s password after they have followed the reset link.
 * @param accessToken  The oobCode / access token from Supabase
 * @param newPassword  The password the user just chose
 */
export async function updateUserPassword(accessToken: string, newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password: newPassword }, { accessToken })

  if (error) throw error
}
