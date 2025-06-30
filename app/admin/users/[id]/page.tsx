"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  Edit,
  CreditCard,
  Zap,
  Users,
  FileText,
  Mail,
  Shield,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Download,
  UserCheck,
  Settings,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock user data - replace with actual API calls
const userData = {
  id: "user_123",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  avatar: "/placeholder.svg?height=80&width=80",
  status: "active",
  emailVerified: true,
  createdAt: "2024-01-15T10:30:00Z",
  lastLoginAt: "2024-11-28T14:20:00Z",
  plan: {
    name: "Growth",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    stripeSubscriptionId: "sub_1234567890",
  },
  credits: {
    used: 145,
    total: 200,
    resetDate: "2024-12-01",
  },
  usage: {
    totalContent: 47,
    totalCreditsUsed: 145,
    avgContentPerWeek: 3.2,
    lastActivity: "2024-11-28T14:20:00Z",
  },
  teamMembers: [
    { id: "1", name: "Sarah Wilson", email: "sarah@company.com", role: "admin", status: "active" },
    { id: "2", name: "Mike Chen", email: "mike@company.com", role: "member", status: "pending" },
  ],
  recentContent: [
    {
      id: "1",
      type: "email",
      title: "Welcome Email Series",
      createdAt: "2024-11-28T10:30:00Z",
      creditsUsed: 3,
      status: "completed",
    },
    {
      id: "2",
      type: "ad",
      title: "Facebook Ad Campaign",
      createdAt: "2024-11-27T15:45:00Z",
      creditsUsed: 2,
      status: "completed",
    },
  ],
  auditLog: [
    {
      id: "1",
      action: "plan_upgraded",
      description: "Upgraded from Starter to Growth plan",
      timestamp: "2024-11-20T09:15:00Z",
      adminUser: "admin@amap.com",
    },
    {
      id: "2",
      action: "credits_adjusted",
      description: "Credits manually adjusted: +50 credits",
      timestamp: "2024-11-15T14:30:00Z",
      adminUser: "admin@amap.com",
    },
  ],
}

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
  })
  const [creditAdjustment, setCreditAdjustment] = useState({
    amount: "",
    reason: "",
    type: "add" as "add" | "subtract",
  })
  const [planChange, setPlanChange] = useState({
    newPlan: userData.plan.name.toLowerCase(),
    reason: "",
  })
  const [isImpersonating, setIsImpersonating] = useState(false)

  const handleSaveUser = () => {
    // TODO: Implement user update API call
    console.log("Saving user:", editForm)
    setIsEditing(false)
  }

  const handleCreditAdjustment = () => {
    // TODO: Implement credit adjustment API call
    console.log("Adjusting credits:", creditAdjustment)
    setCreditAdjustment({ amount: "", reason: "", type: "add" })
  }

  const handlePlanChange = () => {
    // TODO: Implement plan change API call
    console.log("Changing plan:", planChange)
    setPlanChange({ newPlan: userData.plan.name.toLowerCase(), reason: "" })
  }

  const handleImpersonate = () => {
    // TODO: Implement user impersonation with proper security logging
    console.log("Starting impersonation for user:", userId)
    setIsImpersonating(true)
    // This would redirect to the main app with impersonation token
  }

  const handleToggleUserStatus = () => {
    // TODO: Implement user status toggle
    console.log("Toggling user status")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="destructive">
            <Ban className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "ad":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">Manage user account and subscription details</p>
        </div>
        <div className="flex items-center gap-2">
          {isImpersonating && (
            <Alert className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Impersonation Active</AlertTitle>
              <AlertDescription>You are viewing as this user</AlertDescription>
            </Alert>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Impersonate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Impersonate User</DialogTitle>
                <DialogDescription>
                  This will allow you to view the application as this user. All actions will be logged for security
                  purposes.
                </DialogDescription>
              </DialogHeader>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  User impersonation is logged and monitored. Only use this feature for legitimate support purposes.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
                <Button onClick={handleImpersonate}>Start Impersonation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Information</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.firstName} />
                <AvatarFallback className="text-lg">
                  {userData.firstName[0]}
                  {userData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Button onClick={handleSaveUser}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <p className="text-muted-foreground">{userData.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(userData.status)}
                      {userData.emailVerified && (
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Email Verified
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Member since:</span>
                        <p className="font-medium">{new Date(userData.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last login:</span>
                        <p className="font-medium">{new Date(userData.lastLoginAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Account Status</span>
              <Switch checked={userData.status === "active"} onCheckedChange={handleToggleUserStatus} />
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm" className="w-full text-destructive bg-transparent">
              <Ban className="h-4 w-4 mr-2" />
              Suspend Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage & Credits</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Subscription Plan</DialogTitle>
                      <DialogDescription>Update the user's subscription plan</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newPlan">New Plan</Label>
                        <Select
                          value={planChange.newPlan}
                          onValueChange={(value) => setPlanChange({ ...planChange, newPlan: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter - $29/month</SelectItem>
                            <SelectItem value="growth">Growth - $79/month</SelectItem>
                            <SelectItem value="scale">Scale - $199/month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason for Change</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter reason for plan change..."
                          value={planChange.reason}
                          onChange={(e) => setPlanChange({ ...planChange, reason: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={handlePlanChange}>Change Plan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <p className="text-lg font-semibold">{userData.plan.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Status</span>
                    <p className="font-medium">{getStatusBadge(userData.plan.status)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Stripe ID</span>
                    <p className="font-mono text-sm">{userData.plan.stripeSubscriptionId}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <p className="font-medium">{new Date(userData.plan.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Next Billing</span>
                    <p className="font-medium">{new Date(userData.plan.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View in Stripe
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Credit Usage
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Adjust Credits
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adjust User Credits</DialogTitle>
                        <DialogDescription>Manually adjust the user's credit balance</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="adjustmentType">Adjustment Type</Label>
                          <Select
                            value={creditAdjustment.type}
                            onValueChange={(value: "add" | "subtract") =>
                              setCreditAdjustment({ ...creditAdjustment, type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add">Add Credits</SelectItem>
                              <SelectItem value="subtract">Subtract Credits</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter credit amount"
                            value={creditAdjustment.amount}
                            onChange={(e) => setCreditAdjustment({ ...creditAdjustment, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reason">Reason</Label>
                          <Textarea
                            id="reason"
                            placeholder="Enter reason for credit adjustment..."
                            value={creditAdjustment.reason}
                            onChange={(e) => setCreditAdjustment({ ...creditAdjustment, reason: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={handleCreditAdjustment}>Adjust Credits</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{userData.credits.used}</div>
                    <div className="text-muted-foreground">of {userData.credits.total} credits used</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${(userData.credits.used / userData.credits.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Resets on {new Date(userData.credits.resetDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Total Content</span>
                      <p className="text-2xl font-bold">{userData.usage.totalContent}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Credits Used</span>
                      <p className="text-2xl font-bold">{userData.usage.totalCreditsUsed}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Avg. Content/Week</span>
                    <p className="text-lg font-semibold">{userData.usage.avgContentPerWeek}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Last Activity</span>
                    <p className="font-medium">{new Date(userData.usage.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.recentContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(content.type)}
                          <span className="font-medium">{content.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{content.type}</Badge>
                      </TableCell>
                      <TableCell>{content.creditsUsed}</TableCell>
                      <TableCell>{getStatusBadge(content.status)}</TableCell>
                      <TableCell>{new Date(content.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>Track of all administrative actions performed on this account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.auditLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 rounded-full bg-muted">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>By: {log.adminUser}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
