"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

/**
 * Signs the user out and routes back to /auth/signin.
 * Exported as DEFAULT so it satisfies `import SignOutButton from ...`
 */
export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="flex items-center gap-2 bg-transparent"
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Sign out</span>
    </Button>
  )
}
