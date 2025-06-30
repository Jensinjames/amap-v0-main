"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface SignOutButtonProps {
  className?: string
}

/**
 * Logs the user out and routes back to the sign-in page.
 */
export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} className={className}>
      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
      {"Sign out"}
    </Button>
  )
}
