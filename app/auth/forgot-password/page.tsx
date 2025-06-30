"use client"

import { useState, type FormEvent } from "react"
import { sendPasswordResetEmail } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    setError("")
    try {
      await sendPasswordResetEmail(email)
      setStatus("success")
    } catch (err: any) {
      setError(err.message)
      setStatus("error")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <p className="text-center text-sm font-medium text-green-600">Reset link sent! Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                />
              </div>
              <Button className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Sending…" : "Send reset link"}
              </Button>
              {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Remembered?{" "}
            <Link href="/auth/signin" className="underline hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
