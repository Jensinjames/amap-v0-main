"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Play, User, Shield, Settings, AlertTriangle } from "lucide-react"
import {
  createAdminUser,
  logAdminAction,
  createImpersonationToken,
  validateImpersonationToken,
  endImpersonationSession,
} from "@/lib/admin-functions"

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function AdminTestPage() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Test form states
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState<"super_admin" | "admin" | "support">("admin")
  const [targetUserId, setTargetUserId] = useState("")
  const [impersonationDuration, setImpersonationDuration] = useState("60")
  const [testToken, setTestToken] = useState("")
  const [actionDetails, setActionDetails] = useState("")

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [testName]: true }))
    try {
      const result = await testFn()
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: true,
          message: "Test completed successfully",
          data: result,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          message: "Test failed",
          error: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }))
    }
  }

  const testCreateAdminUser = async () => {
    if (!newAdminEmail) {
      throw new Error("Email is required")
    }

    // In a real app, you'd first create the user account
    // For testing, we'll use a mock user ID
    const mockUserId = "test-user-" + Date.now()
    const currentAdminId = "current-admin-id" // In real app, get from auth context

    const result = await createAdminUser(mockUserId, newAdminRole, {}, currentAdminId)
    return result
  }

  const testLogAdminAction = async () => {
    const currentAdminId = "current-admin-id" // In real app, get from auth context
    const details = actionDetails ? JSON.parse(actionDetails) : { test: true }

    await logAdminAction(currentAdminId, targetUserId || null, "test_action", details)
    return { message: "Action logged successfully" }
  }

  const testCreateImpersonationToken = async () => {
    if (!targetUserId) {
      throw new Error("Target user ID is required")
    }

    const currentAdminId = "current-admin-id" // In real app, get from auth context
    const duration = Number.parseInt(impersonationDuration)

    const token = await createImpersonationToken(currentAdminId, targetUserId, duration)
    setTestToken(token) // Store for validation test
    return { token, expiresIn: `${duration} minutes` }
  }

  const testValidateImpersonationToken = async () => {
    if (!testToken) {
      throw new Error("No token to validate. Create a token first.")
    }

    const userId = await validateImpersonationToken(testToken)
    return { validatedUserId: userId, isValid: !!userId }
  }

  const testEndImpersonationSession = async () => {
    if (!testToken) {
      throw new Error("No token to end. Create a token first.")
    }

    const success = await endImpersonationSession(testToken)
    return { ended: success }
  }

  const getResultIcon = (result: TestResult) => {
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getResultBadge = (result: TestResult) => {
    return result.success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Function Testing</h1>
        <p className="text-muted-foreground">Test individual admin functions with custom parameters</p>
      </div>

      <Tabs defaultValue="user-management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="impersonation">Impersonation</TabsTrigger>
          <TabsTrigger value="audit">Audit Logging</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Admin User Management</span>
              </CardTitle>
              <CardDescription>Test creating and managing admin users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">New Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-role">Admin Role</Label>
                  <Select value={newAdminRole} onValueChange={(value: any) => setNewAdminRole(value)}>
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
              </div>
              <Button
                onClick={() => runTest("createAdminUser", testCreateAdminUser)}
                disabled={loading.createAdminUser}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading.createAdminUser ? "Creating..." : "Test Create Admin User"}
              </Button>
              {testResults.createAdminUser && (
                <Alert variant={testResults.createAdminUser.success ? "default" : "destructive"}>
                  <div className="flex items-center space-x-2">
                    {getResultIcon(testResults.createAdminUser)}
                    <AlertTitle>Create Admin User Test</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {testResults.createAdminUser.message}
                    {testResults.createAdminUser.error && (
                      <div className="mt-1 text-sm">{testResults.createAdminUser.error}</div>
                    )}
                    {testResults.createAdminUser.data && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded">
                        {JSON.stringify(testResults.createAdminUser.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impersonation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>User Impersonation</span>
              </CardTitle>
              <CardDescription>Test secure user impersonation functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-user">Target User ID</Label>
                  <Input
                    id="target-user"
                    placeholder="user-uuid-here"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={impersonationDuration}
                    onChange={(e) => setImpersonationDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-token">Test Token (auto-filled after creation)</Label>
                <Input
                  id="test-token"
                  placeholder="Token will appear here after creation"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  onClick={() => runTest("createImpersonationToken", testCreateImpersonationToken)}
                  disabled={loading.createImpersonationToken}
                  variant="outline"
                >
                  {loading.createImpersonationToken ? "Creating..." : "Create Token"}
                </Button>
                <Button
                  onClick={() => runTest("validateImpersonationToken", testValidateImpersonationToken)}
                  disabled={loading.validateImpersonationToken}
                  variant="outline"
                >
                  {loading.validateImpersonationToken ? "Validating..." : "Validate Token"}
                </Button>
                <Button
                  onClick={() => runTest("endImpersonationSession", testEndImpersonationSession)}
                  disabled={loading.endImpersonationSession}
                  variant="outline"
                >
                  {loading.endImpersonationSession ? "Ending..." : "End Session"}
                </Button>
              </div>

              {/* Results for impersonation tests */}
              {["createImpersonationToken", "validateImpersonationToken", "endImpersonationSession"].map(
                (testName) =>
                  testResults[testName] && (
                    <Alert key={testName} variant={testResults[testName].success ? "default" : "destructive"}>
                      <div className="flex items-center space-x-2">
                        {getResultIcon(testResults[testName])}
                        <AlertTitle>
                          {testName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </AlertTitle>
                      </div>
                      <AlertDescription className="mt-2">
                        {testResults[testName].message}
                        {testResults[testName].error && (
                          <div className="mt-1 text-sm">{testResults[testName].error}</div>
                        )}
                        {testResults[testName].data && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded">
                            {JSON.stringify(testResults[testName].data, null, 2)}
                          </pre>
                        )}
                      </AlertDescription>
                    </Alert>
                  ),
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Audit Logging</span>
              </CardTitle>
              <CardDescription>Test admin action logging functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-user-audit">Target User ID (optional)</Label>
                <Input
                  id="target-user-audit"
                  placeholder="user-uuid-here"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-details">Action Details (JSON)</Label>
                <Textarea
                  id="action-details"
                  placeholder='{"key": "value", "description": "Test action"}'
                  value={actionDetails}
                  onChange={(e) => setActionDetails(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={() => runTest("logAdminAction", testLogAdminAction)}
                disabled={loading.logAdminAction}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading.logAdminAction ? "Logging..." : "Test Log Admin Action"}
              </Button>

              {testResults.logAdminAction && (
                <Alert variant={testResults.logAdminAction.success ? "default" : "destructive"}>
                  <div className="flex items-center space-x-2">
                    {getResultIcon(testResults.logAdminAction)}
                    <AlertTitle>Log Admin Action Test</AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {testResults.logAdminAction.message}
                    {testResults.logAdminAction.error && (
                      <div className="mt-1 text-sm">{testResults.logAdminAction.error}</div>
                    )}
                    {testResults.logAdminAction.data && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded">
                        {JSON.stringify(testResults.logAdminAction.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permission Testing</span>
              </CardTitle>
              <CardDescription>Test role-based access control and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Permission Tests</AlertTitle>
                <AlertDescription>
                  Permission tests are automatically run when you visit the Functions page. Navigate to the Functions
                  tab to see detailed permission verification results.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Test Results</CardTitle>
              <CardDescription>Summary of all function tests performed</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tests have been run yet. Use the other tabs to run specific tests.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([testName, result]) => (
                    <div key={testName} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center space-x-3">
                        {getResultIcon(result)}
                        <div>
                          <div className="font-medium">
                            {testName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="text-sm text-muted-foreground">{result.message}</div>
                          {result.error && <div className="text-sm text-red-600">{result.error}</div>}
                        </div>
                      </div>
                      {getResultBadge(result)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
