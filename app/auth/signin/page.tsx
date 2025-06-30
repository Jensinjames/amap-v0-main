"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePasswordSignIn = async (formData: FormData) => {
    setIsLoading(true)
    setMessage("")

    try {
      await signIn(formData)
    } catch (error) {
      setMessage("Invalid email or password")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (formData: FormData) => {
    setIsLoading(true)
    setMessage("")

    const email = formData.get("email") as string

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage("Check your email for the magic link!")
      setIsSuccess(true)
    } catch (error) {
      setMessage("Could not send magic link")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={isSuccess ? "text-green-800" : "text-red-800"}>{message}</AlertDescription>
            </Alert>
          )}

          <form action={handlePasswordSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form action={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-email">Email for Magic Link</Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
          <div className="text-sm text-center">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
