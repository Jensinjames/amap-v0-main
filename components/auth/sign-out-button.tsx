"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SignOutButtonProps {
  className?: string
  label?: string
  showIcon?: boolean
}

export function SignOutButton({ className, label = "Sign out", showIcon = true }: SignOutButtonProps) {
  const router = useRouter()

  const handleClick = async () => {
    await supabase.auth.signOut()
    router.refresh() // invalidate cache & redirect if needed
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className={cn("gap-2", className)}>
      {showIcon && <LogOut className="h-4 w-4" />}
      {label}
    </Button>
  )
}

export default SignOutButton
