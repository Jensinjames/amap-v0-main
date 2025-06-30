"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { updateUserPassword } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [pwd1, setPwd1] = useState("")
  const [pwd2, setPwd2] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pwd1 !== pwd2) {
      setError("Passwords do not match")
      setStatus("error")
      return
    }
    setStatus("loading")
    setError("")
    try {
      await updateUserPassword(pwd1)
      setStatus("success")
      setTimeout(() => router.push("/auth/signin"), 3000)
    } catch (err: any) {
      setError(err.message)
      setStatus("error")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>Enter and confirm your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <p className="text-center text-sm font-medium text-green-600">Password updated! Redirecting…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="pwd1">New password</Label>
                <Input
                  id="pwd1"
                  type="password"
                  minLength={6}
                  required
                  value={pwd1}
                  onChange={(e) => setPwd1(e.target.value)}
                  disabled={status === "loading"}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pwd2">Confirm password</Label>
                <Input
                  id="pwd2"
                  type="password"
                  minLength={6}
                  required
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  disabled={status === "loading"}
                />
              </div>
              <Button className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Updating…" : "Update password"}
              </Button>
              {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
