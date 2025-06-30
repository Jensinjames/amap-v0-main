import { getBrowserClient } from "./supabase/client"
import { createClient as createServerClient } from "./supabase/server"

/**
 * CLIENT-SIDE helper – request a password-reset email.
 * Can be called from React components or Server Actions.
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = getBrowserClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  })
  if (error) throw error
  return true
}

/**
 * SERVER helper – update the user password using the access token that Supabase
 * includes in the URL ({ type : "recovery" }).
 * Must run on the server because it uses the secret session in the cookie.
 */
export async function updateUserPassword(newPassword: string) {
  const supabase = createServerClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return true
}
