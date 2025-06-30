"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

/**
 * A simple sign-out button.  After signing out we refresh the router so that
 * Server Components re-render in the anonymous state.
 */
export default function SignOutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSignOut() {
    await supabase.auth.signOut()
    /* Refresh the entire app tree without a full page reload */
    startTransition(() => router.refresh())
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={isPending} aria-label="Sign out">
      <LogOut className="mr-2 h-4 w-4" />
      Sign&nbsp;Out
    </Button>
  )
}
