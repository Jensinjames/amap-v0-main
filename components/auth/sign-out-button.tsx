"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase/client"

/**
 * Signs the user out and refreshes the current route.
 */
export function SignOutButton({ label = "Sign Out" }: { label?: string }) {
  const router = useRouter()

  const handleClick = async () => {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return <Button onClick={handleClick}>{label}</Button>
}

/* Default export required by earlier imports */
export default SignOutButton
