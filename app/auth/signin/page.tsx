"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    try {
      const signInResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (signInResponse?.error) {
        setError(
          signInResponse.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "An error occurred while signing in.",
        )
      } else {
        // No error, sign-in was successful
        window.location.href = callbackUrl // Redirect manually
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-center">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            <Button className="w-full mt-4" type="submit">
              Sign In
            </Button>
          </form>
          <div className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
