"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendPasswordResetEmail } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetRequest = async (formData: FormData) => {
    setIsLoading(true)
    setMessage("")

    const email = formData.get("email") as string

    try {
      await sendPasswordResetEmail(email)
      setMessage("Password reset link has been sent to your email!")
      setIsSuccess(true)
    } catch (error) {
      setMessage("Could not send reset link. Please try again.")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>{message}</AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <form action={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            Remember your password?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
