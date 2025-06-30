"use client"

import type React from "react"

import { useState } from "react"
import { sendPasswordResetEmail } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")
    try {
      await sendPasswordResetEmail(email)
      setMessage("Password reset link sent! Please check your email.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!message}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !!message}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          {message && <p className="mt-4 text-sm font-medium text-green-600 text-center">{message}</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600 text-center">{error}</p>}
          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/auth/signin" className="underline hover:text-primary">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
