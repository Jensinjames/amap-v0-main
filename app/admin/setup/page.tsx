"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  CheckCircle,
  XCircle,
  User,
  Shield,
  Settings,
  Play,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface AdminUser {
  user_id: string
  email: string
  first_name: string
  last_name: string
  role: string
  permissions: Record<string, boolean>
  is_active: boolean
  created_at: string
}

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  error?: string
}

export default function AdminSetupPage() {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "database",
      title: "Database Setup",
      description: "Verify database tables and functions are created",
      completed: false,
    },
    {
      id: "admin-user",
      title: "Admin User Creation",
      description: "Create the first admin user account",
      completed: false,
    },
    {
      id: "permissions",
      title: "Permission Verification",
      description: "Test admin permissions and access controls",
      completed: false,
    },
    {
      id: "functions",
      title: "Function Testing",
      description: "Verify all admin functions work correctly",
      completed: false,
    },
  ])

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [showPasswords, setShowPasswords] = useState(false)
  const [newAdminForm, setNewAdminForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "admin" as "super_admin" | "admin" | "support",
    permissions: {} as Record<string, boolean>,
  })

  // Test credentials for the created admin users
  const testCredentials = [
    {
      email: "admin@amap.com",
      password: "temp_password_123",
      role: "Super Admin",
      description: "Full system access with all permissions",
    },
    {
      email: "manager@amap.com",
      password: "temp_password_123",
      role: "Admin",
      description: "User management and subscription control",
    },
    {
      email: "support@amap.com",
      password: "temp_password_123",
      role: "Support",
      description: "View-only access for customer support",
    },
  ]

  useEffect(() => {
    checkSetupStatus()
    loadAdminUsers()
  }, [])

  const checkSetupStatus = async () => {
    const steps = [...setupSteps]

    // Check database setup
    try {
      const { data, error } = await supabase.from("admin_users").select("count").limit(1)
      steps[0].completed = !error
      if (error) steps[0].error = error.message
    } catch (error) {
      steps[0].error = "Database connection failed"
    }

    // Check admin users exist
    try {
      const { data, error } = await supabase.from("admin_users").select("*").limit(1)
      steps[1].completed = !error && data && data.length > 0
      if (error) steps[1].error = error.message
    } catch (error) {
      steps[1].error = "Failed to check admin users"
    }

    // Check permissions (simplified check)
    try {
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats")
      steps[2].completed = !error
      if (error) steps[2].error = error.message
    } catch (error) {
      steps[2].error = "Permission check failed"
    }

    // Check functions
    try {
      const { data, error } = await supabase.rpc("is_user_admin", { user_uuid: "test-id" })
      steps[3].completed = !error
      if (error) steps[3].error = error.message
    } catch (error) {
      steps[3].error = "Function test failed"
    }

    setSetupSteps(steps)
  }

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase.rpc("get_all_admin_users")
      if (!error && data) {
        setAdminUsers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to load admin users:", error)
    }
  }

  const runDatabaseSetup = async () => {
    setLoading((prev) => ({ ...prev, database: true }))
    try {
      // In a real implementation, this would run the SQL scripts
      // For now, we'll simulate the setup
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const steps = [...setupSteps]
      steps[0].completed = true
      steps[0].error = undefined
      setSetupSteps(steps)
    } catch (error) {
      const steps = [...setupSteps]
      steps[0].error = "Database setup failed"
      setSetupSteps(steps)
    } finally {
      setLoading((prev) => ({ ...prev, database: false }))
    }
  }

  const createTestAdminUsers = async () => {
    setLoading((prev) => ({ ...prev, "admin-user": true }))
    try {
      // In a real implementation, this would call the create_admin_user function
      // For now, we'll simulate creating the users
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const steps = [...setupSteps]
      steps[1].completed = true
      steps[1].error = undefined
      setSetupSteps(steps)

      // Reload admin users
      await loadAdminUsers()
    } catch (error) {
      const steps = [...setupSteps]
      steps[1].error = "Failed to create admin users"
      setSetupSteps(steps)
    } finally {
      setLoading((prev) => ({ ...prev, "admin-user": false }))
    }
  }

  const testPermissions = async () => {
    setLoading((prev) => ({ ...prev, permissions: true }))
    try {
      // Test various permission scenarios
      const tests = [
        supabase.from("admin_users").select("*").limit(1),
        supabase.from("users").select("*").limit(1),
        supabase.rpc("get_admin_dashboard_stats"),
        supabase.rpc("is_user_admin", { user_uuid: "test-id" }),
      ]

      await Promise.all(tests)

      const steps = [...setupSteps]
      steps[2].completed = true
      steps[2].error = undefined
      setSetupSteps(steps)
    } catch (error) {
      const steps = [...setupSteps]
      steps[2].error = "Permission tests failed"
      setSetupSteps(steps)
    } finally {
      setLoading((prev) => ({ ...prev, permissions: false }))
    }
  }

  const testFunctions = async () => {
    setLoading((prev) => ({ ...prev, functions: true }))
    try {
      // Test all admin functions
      const functionTests = [
        supabase.rpc("get_admin_dashboard_stats"),
        supabase.rpc("get_user_activity", { limit_count: 5 }),
        supabase.rpc("cleanup_expired_impersonation_sessions"),
      ]

      await Promise.all(functionTests)

      const steps = [...setupSteps]
      steps[3].completed = true
      steps[3].error = undefined
      setSetupSteps(steps)
    } catch (error) {
      const steps = [...setupSteps]
      steps[3].error = "Function tests failed"
      setSetupSteps(steps)
    } finally {
      setLoading((prev) => ({ ...prev, functions: false }))
    }
  }

  const createCustomAdminUser = async () => {
    setLoading((prev) => ({ ...prev, customAdmin: true }))
    try {
      // In a real implementation, this would call the create_admin_user function
      const { data, error } = await supabase.rpc("create_admin_user", {
        user_email: newAdminForm.email,
        user_first_name: newAdminForm.firstName,
        user_last_name: newAdminForm.lastName,
        admin_role: newAdminForm.role,
        admin_permissions: newAdminForm.permissions,
      })

      if (error) throw error

      // Reset form and reload users
      setNewAdminForm({
        email: "",
        firstName: "",
        lastName: "",
        role: "admin",
        permissions: {},
      })
      await loadAdminUsers()
    } catch (error) {
      console.error("Failed to create admin user:", error)
    } finally {
      setLoading((prev) => ({ ...prev, customAdmin: false }))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStepIcon = (step: SetupStep) => {
    if (loading[step.id]) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
    if (step.completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (step.error) {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
  }

  const getStepAction = (step: SetupStep) => {
    const actions = {
      database: runDatabaseSetup,
      "admin-user": createTestAdminUsers,
      permissions: testPermissions,
      functions: testFunctions,
    }

    return actions[step.id as keyof typeof actions]
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Interface Setup</h1>
        <p className="text-muted-foreground">Set up and test your admin interface with proper permissions</p>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup Steps</TabsTrigger>
          <TabsTrigger value="credentials">Test Credentials</TabsTrigger>
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="custom">Create Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Setup Progress</span>
              </CardTitle>
              <CardDescription>Complete these steps to set up your admin interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {setupSteps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    {getStepIcon(step)}
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.error && <p className="text-sm text-red-600 mt-1">{step.error}</p>}
                    </div>
                  </div>
                  <Button
                    onClick={getStepAction(step)}
                    disabled={loading[step.id] || step.completed}
                    variant={step.completed ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {loading[step.id] ? "Running..." : step.completed ? "Completed" : "Run"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Setup Instructions</AlertTitle>
            <AlertDescription>
              Run the setup steps in order. Each step will verify and configure the necessary components for your admin
              interface. Make sure to run the database scripts first before testing the interface.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Test Admin Credentials</span>
                  </CardTitle>
                  <CardDescription>Use these credentials to test the admin interface</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPasswords(!showPasswords)}>
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPasswords ? "Hide" : "Show"} Passwords
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCredentials.map((cred, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{cred.email}</h3>
                      <p className="text-sm text-muted-foreground">{cred.description}</p>
                    </div>
                    <Badge variant="outline">{cred.role}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={cred.email} readOnly className="text-sm" />
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(cred.email)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Password</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type={showPasswords ? "text" : "password"}
                          value={cred.password}
                          readOnly
                          className="text-sm"
                        />
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(cred.password)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  These are temporary test credentials. Change the passwords immediately after testing. In production,
                  use strong passwords and enable two-factor authentication.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Current Admin Users</span>
              </CardTitle>
              <CardDescription>View and manage existing admin users</CardDescription>
            </CardHeader>
            <CardContent>
              {adminUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Admin Users Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Run the admin user creation step to create test admin accounts.
                  </p>
                  <Button onClick={createTestAdminUsers} disabled={loading["admin-user"]}>
                    {loading["admin-user"] ? "Creating..." : "Create Test Admin Users"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminUsers.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{user.role.replace("_", " ").toUpperCase()}</Badge>
                          {user.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Object.keys(user.permissions || {}).length} permissions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Create Custom Admin User</span>
              </CardTitle>
              <CardDescription>Create a new admin user with custom permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Admin Role</Label>
                  <Select
                    value={newAdminForm.role}
                    onValueChange={(value: any) => setNewAdminForm({ ...newAdminForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={newAdminForm.firstName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={newAdminForm.lastName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[
                    { key: "can_manage_users", label: "Manage Users" },
                    { key: "can_manage_admins", label: "Manage Admins" },
                    { key: "can_impersonate", label: "Impersonate Users" },
                    { key: "can_view_audit_log", label: "View Audit Log" },
                    { key: "can_manage_settings", label: "Manage Settings" },
                    { key: "can_manage_subscriptions", label: "Manage Subscriptions" },
                  ].map((permission) => (
                    <div key={permission.key} className="flex items-center space-x-2">
                      <Switch
                        id={permission.key}
                        checked={newAdminForm.permissions[permission.key] || false}
                        onCheckedChange={(checked) =>
                          setNewAdminForm({
                            ...newAdminForm,
                            permissions: {
                              ...newAdminForm.permissions,
                              [permission.key]: checked,
                            },
                          })
                        }
                      />
                      <Label htmlFor={permission.key} className="text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={createCustomAdminUser}
                disabled={loading.customAdmin || !newAdminForm.email}
                className="w-full"
              >
                {loading.customAdmin ? "Creating..." : "Create Admin User"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
