"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserPassword } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await updateUserPassword(password)
      setMessage("Your password has been updated successfully! Redirecting to sign in...")
      setTimeout(() => {
        router.push("/auth/signin")
      }, 3000)
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
          <CardTitle className="text-2xl">Update Your Password</CardTitle>
          <CardDescription>Enter and confirm your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !!message}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !!message}
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !!message}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
          {message && <p className="mt-4 text-sm font-medium text-green-600 text-center">{message}</p>}
          {error && <p className="mt-4 text-sm font-medium text-red-600 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
