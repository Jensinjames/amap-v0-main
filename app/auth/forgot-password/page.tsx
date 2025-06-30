"use client"

import type React from "react"

import { useState } from "react"
import { sendPasswordResetEmail } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Check your email</h1>
        <p>We’ve sent you a link to reset your password.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto py-16 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-center">Forgot your password?</h1>
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  )
}
