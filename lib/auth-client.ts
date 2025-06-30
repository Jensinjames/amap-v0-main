"use client"

import { supabase } from "@/lib/supabase/client"

export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  })
  if (error) throw error
  return data
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password })
  if (error) throw error
  return data
}

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  })
  if (error) throw error
  return data
}
