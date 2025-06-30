"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  MoreHorizontal,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  DollarSign,
} from "lucide-react"

const subscriptions = [
  {
    id: "sub_1",
    customerName: "John Doe",
    email: "john@example.com",
    plan: "Growth",
    status: "Active",
    amount: 79,
    nextBilling: "2024-12-15",
    created: "2024-01-15",
    stripeId: "sub_1234567890",
    trialEnd: null,
  },
  {
    id: "sub_2",
    customerName: "Sarah Wilson",
    email: "sarah@company.com",
    plan: "Scale",
    status: "Active",
    amount: 199,
    nextBilling: "2024-12-20",
    created: "2024-02-03",
    stripeId: "sub_0987654321",
    trialEnd: null,
  },
  {
    id: "sub_3",
    customerName: "Mike Chen",
    email: "mike@startup.io",
    plan: "Starter",
    status: "Trialing",
    amount: 29,
    nextBilling: "2024-12-10",
    created: "2024-03-10",
    stripeId: "sub_1122334455",
    trialEnd: "2024-12-10",
  },
  {
    id: "sub_4",
    customerName: "Emily Rodriguez",
    email: "emily@agency.com",
    plan: "Growth",
    status: "Past Due",
    amount: 79,
    nextBilling: "2024-11-28",
    created: "2024-01-28",
    stripeId: "sub_5566778899",
    trialEnd: null,
  },
  {
    id: "sub_5",
    customerName: "David Kim",
    email: "david@freelance.com",
    plan: "Starter",
    status: "Canceled",
    amount: 29,
    nextBilling: null,
    created: "2024-02-15",
    stripeId: "sub_9988776655",
    trialEnd: null,
  },
]

const subscriptionStats = {
  totalRevenue: 152340,
  monthlyRecurring: 18750,
  activeSubscriptions: 1923,
  trialConversions: 68.5,
  churnRate: 3.2,
  avgRevenuePerUser: 79.2,
}

export default function AdminSubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.stripeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesPlan = planFilter === "all" || sub.plan.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "trialing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Trial
          </Badge>
        )
      case "past due":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Past Due
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "starter":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "growth":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "scale":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor and manage customer subscriptions and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Stripe
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${subscriptionStats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${subscriptionStats.monthlyRecurring.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.7% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.activeSubscriptions.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.trialConversions}%</div>
            <Progress value={subscriptionStats.trialConversions} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.churnRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -0.8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${subscriptionStats.avgRevenuePerUser}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, or Stripe ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>Manage customer subscriptions and billing status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.customerName}</div>
                      <div className="text-sm text-muted-foreground">{subscription.email}</div>
                      <div className="text-xs text-muted-foreground">{subscription.stripeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPlanColor(subscription.plan)}>
                      {subscription.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>
                    <div className="font-medium">${subscription.amount}/month</div>
                    {subscription.trialEnd && (
                      <div className="text-xs text-muted-foreground">Trial ends: {subscription.trialEnd}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {subscription.nextBilling ? (
                      <div className="text-sm">{subscription.nextBilling}</div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{subscription.created}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CreditCard className="h-4 w-4 mr-2" />
                          View in Stripe
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Update Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No subscriptions found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
