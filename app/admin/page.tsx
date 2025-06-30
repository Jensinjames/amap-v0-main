"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  CreditCard,
  FileText,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import Link from "next/link"

const stats = {
  totalUsers: 2847,
  activeSubscriptions: 1923,
  totalRevenue: 152340,
  contentGenerated: 45672,
  trialUsers: 324,
  churnRate: 3.2,
  avgRevenuePerUser: 79.2,
  systemUptime: 99.97,
}

const recentActivity = [
  {
    id: 1,
    type: "user_signup",
    message: "New user registered: sarah@example.com",
    timestamp: "2 minutes ago",
    severity: "info",
  },
  {
    id: 2,
    type: "subscription_upgrade",
    message: "User upgraded to Scale plan: john@company.com",
    timestamp: "5 minutes ago",
    severity: "success",
  },
  {
    id: 3,
    type: "payment_failed",
    message: "Payment failed for user: mike@startup.io",
    timestamp: "12 minutes ago",
    severity: "warning",
  },
  {
    id: 4,
    type: "high_usage",
    message: "User approaching credit limit: team@agency.com",
    timestamp: "18 minutes ago",
    severity: "warning",
  },
  {
    id: 5,
    type: "content_generated",
    message: "1,000+ content pieces generated in last hour",
    timestamp: "1 hour ago",
    severity: "info",
  },
]

const quickActions = [
  {
    title: "Manage Users",
    description: "View and manage user accounts",
    href: "/admin/users",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Subscriptions",
    description: "Monitor subscription status and billing",
    href: "/admin/subscriptions",
    icon: CreditCard,
    color: "bg-green-500",
  },
  {
    title: "Content Analytics",
    description: "Track content generation and usage",
    href: "/admin/content",
    icon: FileText,
    color: "bg-purple-500",
  },
  {
    title: "System Health",
    description: "Monitor system performance and alerts",
    href: "/admin/system",
    icon: Activity,
    color: "bg-orange-500",
  },
]

export default function AdminDashboard() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success":
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
      case "warning":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20"
      case "error":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <Users className="h-4 w-4" />
      case "subscription_upgrade":
        return <TrendingUp className="h-4 w-4" />
      case "payment_failed":
        return <AlertTriangle className="h-4 w-4" />
      case "high_usage":
        return <Activity className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your AMAP platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentGenerated.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              +23.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialUsers}</div>
            <p className="text-xs text-muted-foreground">Active trial accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDown className="h-3 w-3 mr-1 text-green-500" />
              -0.8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgRevenuePerUser}</div>
            <p className="text-xs text-muted-foreground">Average revenue per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemUptime}%</div>
            <Progress value={stats.systemUptime} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium group-hover:text-primary transition-colors">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full ${getSeverityColor(activity.severity)}`}>
                    {getSeverityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/activity">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
