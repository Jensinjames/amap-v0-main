"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 bg-transparent">
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  )
}
