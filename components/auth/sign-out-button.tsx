"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Refresh the current route to reflect the signed-out state
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sign&nbsp;out
    </Button>
  )
}
