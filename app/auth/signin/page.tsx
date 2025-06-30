"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Mail, Lock, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  const handlePasswordSignIn = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    const email = formData.get("magic-email") as string

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMagicLinkSent(true)
    } catch (error: any) {
      setError(error.message || "Could not send magic link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your AMAP account to continue creating amazing content</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {(error || message) && (
              <Alert className={error ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
                <AlertDescription className={error ? "text-red-800" : "text-blue-800"}>
                  {error || message}
                </AlertDescription>
              </Alert>
            )}

            {magicLinkSent ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Check your email</h3>
                  <p className="text-sm text-muted-foreground mt-1">We've sent a magic link to your email</p>
                </div>
                <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="w-full">
                  Try another method
                </Button>
              </div>
            ) : (
              <>
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
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                      </Link>
                    </div>
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
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <form action={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email for Magic Link</Label>
                    <Input
                      id="magic-email"
                      name="magic-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Magic Link
                  </Button>
                </form>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
