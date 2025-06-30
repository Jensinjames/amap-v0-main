"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateUserPassword } from "@/lib/auth"

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handlePasswordUpdate = async (formData: FormData) => {
    setIsLoading(true)
    setMessage("")

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      setIsSuccess(false)
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long")
      setIsSuccess(false)
      setIsLoading(false)
      return
    }

    try {
      await updateUserPassword(password)
      setMessage("Password updated successfully! Redirecting to sign in...")
      setIsSuccess(true)

      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch (error) {
      setMessage("Could not update password. Please try again.")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Update your password</CardTitle>
          <CardDescription className="text-center">Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>{message}</AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <form action={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Enter your new password"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm your new password"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
