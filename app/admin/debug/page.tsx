"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Table,
  Settings,
  RefreshCw,
  FileText,
  Shield,
} from "lucide-react"
import {
  checkDatabaseHealth,
  testDatabaseConnection,
  validateRLSPolicies,
  type DatabaseStatus,
  type TableInfo,
} from "@/lib/database-setup"

export default function AdminDebugPage() {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; error?: string } | null>(null)
  const [rlsStatus, setRlsStatus] = useState<{ valid: boolean; issues: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const [dbStatus, connStatus, rlsValidation] = await Promise.all([
        checkDatabaseHealth(),
        testDatabaseConnection(),
        validateRLSPolicies(),
      ])

      setDatabaseStatus(dbStatus)
      setConnectionStatus(connStatus)
      setRlsStatus(rlsValidation)
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getTableStatusBadge = (table: TableInfo) => {
    if (!table.exists) {
      return <Badge variant="destructive">Missing</Badge>
    }
    if (table.rowCount === 0) {
      return <Badge variant="secondary">Empty</Badge>
    }
    return <Badge variant="default">Active ({table.rowCount} rows)</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Debug Console</h1>
          <p className="text-muted-foreground">Verify database setup and troubleshoot issues</p>
        </div>
        <Button onClick={runHealthCheck} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {databaseStatus && getStatusIcon(databaseStatus.isHealthy)}
              <div className="text-2xl font-bold">{databaseStatus?.isHealthy ? "Healthy" : "Issues Found"}</div>
            </div>
            <p className="text-xs text-muted-foreground">{databaseStatus?.tables.length || 0} tables checked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {connectionStatus && getStatusIcon(connectionStatus.connected)}
              <div className="text-2xl font-bold">{connectionStatus?.connected ? "Connected" : "Failed"}</div>
            </div>
            <p className="text-xs text-muted-foreground">Supabase connection status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {rlsStatus && getStatusIcon(rlsStatus.valid)}
              <div className="text-2xl font-bold">{rlsStatus?.valid ? "Secure" : "Issues"}</div>
            </div>
            <p className="text-xs text-muted-foreground">RLS policies validation</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alerts */}
      {databaseStatus?.errors && databaseStatus.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Issues Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {databaseStatus.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Overview</CardTitle>
              <CardDescription>Summary of database health and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Tables Status</h4>
                  <div className="space-y-2">
                    {databaseStatus?.tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between">
                        <span className="text-sm">{table.name}</span>
                        {getTableStatusBadge(table)}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Functions</h4>
                  <div className="text-sm text-muted-foreground">
                    {databaseStatus?.functions.length || 0} functions available
                  </div>
                  <div className="mt-2 space-y-1">
                    {databaseStatus?.functions.slice(0, 5).map((func) => (
                      <div key={func} className="text-xs">
                        • {func}
                      </div>
                    ))}
                    {(databaseStatus?.functions.length || 0) > 5 && (
                      <div className="text-xs text-muted-foreground">
                        +{(databaseStatus?.functions.length || 0) - 5} more...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="grid gap-4">
            {databaseStatus?.tables.map((table) => (
              <Card key={table.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Table className="h-4 w-4" />
                      <span>{table.name}</span>
                    </CardTitle>
                    {getTableStatusBadge(table)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Columns ({table.columns.length})</h5>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {table.columns.map((column, index) => (
                            <div key={index} className="text-xs font-mono">
                              {column}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Indexes ({table.indexes.length})</h5>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {table.indexes.map((index, i) => (
                            <div key={i} className="text-xs">
                              {index}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Policies ({table.policies.length})</h5>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {table.policies.map((policy, i) => (
                            <div key={i} className="text-xs">
                              {policy}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Triggers ({table.triggers.length})</h5>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {table.triggers.map((trigger, i) => (
                            <div key={i} className="text-xs">
                              {trigger}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Functions</CardTitle>
              <CardDescription>Available stored procedures and functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {databaseStatus?.functions.map((func) => (
                  <div key={func} className="flex items-center space-x-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-mono">{func}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Row Level Security Status</CardTitle>
              <CardDescription>RLS policies and security configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {rlsStatus?.valid ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>All RLS policies are properly configured</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span>RLS policy issues detected</span>
                  </div>
                  <div className="space-y-2">
                    {rlsStatus?.issues.map((issue, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup Scripts</CardTitle>
              <CardDescription>Run these scripts in order to set up your database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "01-create-users-table.sql", description: "Create users table and auth integration" },
                  { name: "02-create-core-tables.sql", description: "Create core application tables" },
                  { name: "03-create-admin-tables.sql", description: "Create admin and management tables" },
                  { name: "04-insert-default-data.sql", description: "Insert default data and settings" },
                  { name: "05-create-functions.sql", description: "Create utility functions" },
                  { name: "debug-check-tables.sql", description: "Verify database setup" },
                ].map((script, index) => (
                  <div key={script.name} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{script.name}</div>
                        <div className="text-sm text-muted-foreground">{script.description}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Script
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      {databaseStatus && (
        <div className="text-center text-sm text-muted-foreground">
          Last checked: {databaseStatus.lastChecked.toLocaleString()}
        </div>
      )}
    </div>
  )
}
