"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw, Shield, Clock, User, Database } from "lucide-react"
import {
  testAdminFunctions,
  checkAdminPermissions,
  testDatabasePermissions,
  getAdminUsers,
  getAdminAuditLog,
  type FunctionTestResult,
  type AdminUser,
  type AdminAction,
} from "@/lib/admin-functions"

export default function AdminFunctionsPage() {
  const [functionResults, setFunctionResults] = useState<FunctionTestResult[]>([])
  const [permissions, setPermissions] = useState<{
    isAdmin: boolean
    role?: string
    permissions: Record<string, boolean>
  } | null>(null)
  const [dbPermissions, setDbPermissions] = useState<{
    canReadUsers: boolean
    canReadAdminUsers: boolean
    canReadAuditLog: boolean
    canExecuteFunctions: boolean
    errors: string[]
  } | null>(null)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [auditLog, setAuditLog] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("functions")

  // Mock current user ID - in real app, get from auth context
  const currentUserId = "00000000-0000-0000-0000-000000000000"

  const runAllTests = async () => {
    setLoading(true)
    try {
      // Test admin functions
      const funcResults = await testAdminFunctions(currentUserId)
      setFunctionResults(funcResults)

      // Check permissions
      const perms = await checkAdminPermissions(currentUserId)
      setPermissions(perms)

      // Test database permissions
      const dbPerms = await testDatabasePermissions(currentUserId)
      setDbPermissions(dbPerms)

      // Get admin users
      const admins = await getAdminUsers()
      setAdminUsers(admins)

      // Get audit log
      const audit = await getAdminAuditLog(20)
      setAuditLog(audit)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runAllTests()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Pass
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Fail
      </Badge>
    )
  }

  const successfulTests = functionResults.filter((r) => r.success).length
  const totalTests = functionResults.length
  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Functions Test</h1>
          <p className="text-muted-foreground">Verify admin functions and permissions</p>
        </div>
        <Button onClick={runAllTests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Run All Tests
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Function Tests</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {successfulTests}/{totalTests}
            </div>
            <Progress value={successRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{successRate.toFixed(1)}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {permissions && getStatusIcon(permissions.isAdmin)}
              <div className="text-2xl font-bold">{permissions?.isAdmin ? "Admin" : "User"}</div>
            </div>
            <p className="text-xs text-muted-foreground">{permissions?.role || "No role"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Access</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {dbPermissions && getStatusIcon(dbPermissions.errors.length === 0)}
              <div className="text-2xl font-bold">
                {dbPermissions ? (dbPermissions.errors.length === 0 ? "Full" : "Limited") : "Testing..."}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {dbPermissions ? `${dbPermissions.errors.length} errors` : "Checking..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">Active admin accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alerts */}
      {dbPermissions && dbPermissions.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Permission Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {dbPermissions.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="functions">Function Tests</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Function Tests</CardTitle>
              <CardDescription>Results of testing all admin database functions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Function</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>Result/Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {functionResults.map((result) => (
                    <TableRow key={result.functionName}>
                      <TableCell className="font-mono text-sm">{result.functionName}</TableCell>
                      <TableCell>{getStatusBadge(result.success)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{result.executionTime}ms</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.success ? (
                          <span className="text-green-600 text-sm">
                            {typeof result.result === "object"
                              ? JSON.stringify(result.result).substring(0, 50) + "..."
                              : String(result.result)}
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm">{result.error}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current User Permissions</CardTitle>
                <CardDescription>Your admin role and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Is Admin:</span>
                  {permissions && getStatusIcon(permissions.isAdmin)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Role:</span>
                  <Badge variant="outline">{permissions?.role || "None"}</Badge>
                </div>
                <div>
                  <span className="font-semibold">Permissions:</span>
                  <div className="mt-2 space-y-2">
                    {permissions?.permissions && Object.keys(permissions.permissions).length > 0 ? (
                      Object.entries(permissions.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{key}:</span>
                          {getStatusIcon(value)}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No specific permissions set</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Permissions</CardTitle>
                <CardDescription>Access to database tables and functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dbPermissions && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Read Users:</span>
                      {getStatusIcon(dbPermissions.canReadUsers)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Read Admin Users:</span>
                      {getStatusIcon(dbPermissions.canReadAdminUsers)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Read Audit Log:</span>
                      {getStatusIcon(dbPermissions.canReadAuditLog)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Execute Functions:</span>
                      {getStatusIcon(dbPermissions.canExecuteFunctions)}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>All users with admin privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {admin.user?.first_name} {admin.user?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{admin.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{admin.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.is_active ? "default" : "secondary"}>
                          {admin.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Actions</CardTitle>
              <CardDescription>Audit log of admin activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLog.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{action.action}</div>
                            {action.details && Object.keys(action.details).length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {JSON.stringify(action.details).substring(0, 50)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{action.admin_user_id.substring(0, 8)}...</TableCell>
                        <TableCell className="text-sm">
                          {action.target_user_id ? action.target_user_id.substring(0, 8) + "..." : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">{new Date(action.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
