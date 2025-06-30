"use client"

import type React from "react"

import { useState } from "react"
import { updateUserPassword } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateUserPassword(password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto py-16 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-center">Set a new password</h1>
      <Input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" className="w-full">
        Update password
      </Button>
    </form>
  )
}
