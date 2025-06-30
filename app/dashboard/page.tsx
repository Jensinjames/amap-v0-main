"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  FileText,
  Users,
  Mail,
  Megaphone,
  Globe,
  MessageSquare,
  PenTool,
  Workflow,
  Plus,
  ArrowRight,
  Clock,
  Download,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignOutButton from "@/components/auth/sign-out-button"

export const dynamic = "force-dynamic"

const contentTypes = [
  {
    id: "email",
    name: "Email Sequence",
    icon: Mail,
    description: "Create converting email campaigns",
    color: "bg-blue-500",
  },
  {
    id: "ad",
    name: "Ad Copy",
    icon: Megaphone,
    description: "Generate high-performing ad copy",
    color: "bg-green-500",
  },
  {
    id: "landing",
    name: "Landing Page",
    icon: Globe,
    description: "Build compelling landing pages",
    color: "bg-purple-500",
  },
  {
    id: "social",
    name: "Social Posts",
    icon: MessageSquare,
    description: "Create engaging social content",
    color: "bg-pink-500",
  },
  {
    id: "blog",
    name: "Blog Content",
    icon: PenTool,
    description: "Write SEO-optimized blog posts",
    color: "bg-orange-500",
  },
  {
    id: "funnel",
    name: "Sales Funnel",
    icon: Workflow,
    description: "Design complete sales funnels",
    color: "bg-indigo-500",
  },
]

const recentContent = [
  {
    id: 1,
    type: "Email Sequence",
    title: "Welcome Series for SaaS",
    createdAt: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    type: "Ad Copy",
    title: "Facebook Ad Campaign",
    createdAt: "1 day ago",
    status: "completed",
  },
  {
    id: 3,
    type: "Landing Page",
    title: "Product Launch Page",
    createdAt: "2 days ago",
    status: "completed",
  },
]

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/signin")
  }

  const [currentPlan] = useState({
    name: "Growth",
    status: "active",
    trialDays: 0,
    renewsAt: "Dec 15, 2024",
  })

  const [credits] = useState({
    used: 45,
    total: 200,
    resetDate: "Dec 1, 2024",
  })

  const [stats] = useState({
    assetsCreated: 127,
    avgGenerationTime: "2.3s",
    teamMembers: 3,
  })

  const creditPercentage = (credits.used / credits.total) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.user_metadata?.first_name || user.email}!</p>
        </div>
        <SignOutButton />
      </div>

      {/* User Information Card */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">User Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Name:</strong> {user.user_metadata?.first_name} {user.user_metadata?.last_name}
            </p>
            <p>
              <strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || "").toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
            <p>• Generate content</p>
            <p>• Manage team</p>
            <p>• View analytics</p>
            <p>• Update billing</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Recent Activity</CardTitle>
          <CardDescription>Your latest actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
            <p className="text-sm text-gray-600">No recent activity</p>
          </div>
        </CardContent>
      </Card>

      {/* Session Information Card */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to your Dashboard</CardTitle>
          <CardDescription>You have successfully logged in. Here is your session information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
            <p>
              <strong>Expires at:</strong> {new Date(user.expires_at * 1000).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Left</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.total - credits.used}</div>
            <div className="space-y-2 mt-2">
              <Progress value={creditPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {credits.used} of {credits.total} used • Resets {credits.resetDate}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assetsCreated}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Generation Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgGenerationTime}</div>
            <p className="text-xs text-muted-foreground">-0.5s from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">2 seats remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Generation Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Create New Content</h2>
          <Link href="/generate" className="text-sm text-primary hover:underline">
            View all generators
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/generate/${type.id}`}>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground bg-transparent"
                  >
                    Generate Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Content</h2>
          <Link href="/content" className="text-sm text-primary hover:underline">
            View all content
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {recentContent.length > 0 ? (
              <div className="divide-y">
                {recentContent.map((content) => (
                  <div key={content.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{content.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {content.type} • {content.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Completed</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No content yet</h3>
                <p className="text-muted-foreground mb-4">Start creating your first piece of AI-powered content</p>
                <Link href="/generate">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Content
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
