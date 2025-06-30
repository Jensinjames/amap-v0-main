"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, MoreHorizontal, Mail, CreditCard, Download, RefreshCw, Eye, Edit, Ban } from "lucide-react"

const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    plan: "Growth",
    status: "Active",
    credits: { used: 45, total: 200 },
    joinDate: "2024-01-15",
    lastActive: "2 hours ago",
    totalSpent: 237,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    plan: "Scale",
    status: "Active",
    credits: { used: 127, total: 500 },
    joinDate: "2024-02-03",
    lastActive: "1 day ago",
    totalSpent: 597,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@startup.io",
    plan: "Starter",
    status: "Trial",
    credits: { used: 23, total: 50 },
    joinDate: "2024-03-10",
    lastActive: "3 hours ago",
    totalSpent: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily@agency.com",
    plan: "Growth",
    status: "Past Due",
    credits: { used: 189, total: 200 },
    joinDate: "2024-01-28",
    lastActive: "5 days ago",
    totalSpent: 316,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david@freelance.com",
    plan: "Starter",
    status: "Canceled",
    credits: { used: 12, total: 50 },
    joinDate: "2024-02-15",
    lastActive: "2 weeks ago",
    totalSpent: 58,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"suspend" | "refund" | "upgrade" | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesPlan = planFilter === "all" || user.plan.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "trial":
        return <Badge variant="secondary">Trial</Badge>
      case "past due":
        return <Badge variant="destructive">Past Due</Badge>
      case "canceled":
        return <Badge variant="outline">Canceled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      starter: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      growth: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      scale: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    }
    return (
      <Badge variant="outline" className={colors[plan.toLowerCase() as keyof typeof colors]}>
        {plan}
      </Badge>
    )
  }

  const handleUserAction = (user: any, action: "suspend" | "refund" | "upgrade") => {
    setSelectedUser(user)
    setActionType(action)
    setIsActionDialogOpen(true)
  }

  const executeAction = () => {
    // TODO: Implement actual user actions
    console.log(`Executing ${actionType} for user:`, selectedUser.email)
    setIsActionDialogOpen(false)
    setActionType(null)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, subscriptions, and access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
                placeholder="Search users by name or email..."
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
                <SelectItem value="trial">Trial</SelectItem>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage and monitor user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(user.plan)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.credits.used}/{user.credits.total}
                      <div className="w-16 bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${(user.credits.used / user.credits.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${user.totalSpent}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setIsUserDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUserAction(user, "upgrade")}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction(user, "refund")}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Process Refund
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user, "suspend")}
                          className="text-destructive"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Detailed information about the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getPlanBadge(selectedUser.plan)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Join Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Active</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.lastActive}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Spent</Label>
                  <p className="text-sm text-muted-foreground">${selectedUser.totalSpent}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Credits Used</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.credits.used}/{selectedUser.credits.total}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Recent Activity</Label>
                <div className="border rounded-lg p-3 text-sm text-muted-foreground">
                  <p>• Generated email sequence - 2 hours ago</p>
                  <p>• Created ad copy - 1 day ago</p>
                  <p>• Upgraded to Growth plan - 3 days ago</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "suspend" && "Suspend Account"}
              {actionType === "refund" && "Process Refund"}
              {actionType === "upgrade" && "Manage Subscription"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "suspend" && "This will suspend the user's account and prevent access to the platform."}
              {actionType === "refund" && "Process a refund for this user's recent payment."}
              {actionType === "upgrade" && "Manage the user's subscription and billing settings."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === "suspend" && (
              <div>
                <Label htmlFor="reason">Reason for suspension</Label>
                <Textarea id="reason" placeholder="Enter reason for account suspension..." />
              </div>
            )}
            {actionType === "refund" && (
              <div>
                <Label htmlFor="amount">Refund Amount</Label>
                <Input id="amount" placeholder="$0.00" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeAction} variant={actionType === "suspend" ? "destructive" : "default"}>
              {actionType === "suspend" && "Suspend Account"}
              {actionType === "refund" && "Process Refund"}
              {actionType === "upgrade" && "Update Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
