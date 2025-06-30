"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Database, RefreshCw, Play, FileText, Settings, Users, Shield } from "lucide-react"

interface DatabaseCheck {
  success: boolean
  error?: string
  tableCount?: number
  functionsAvailable?: boolean
  missingTables?: string[]
  details?: any
}

interface TableInfo {
  table: string
  exists: boolean
  error?: string
  rowCount?: number
}

export default function AdminDebugPage() {
  const [databaseCheck, setDatabaseCheck] = useState<DatabaseCheck | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [tableDetails, setTableDetails] = useState<TableInfo[]>([])

  const checkDatabase = async () => {
    setIsChecking(true)
    try {
      // This would call your database check function
      // For now, we'll simulate the check
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate a successful check
      const mockResult: DatabaseCheck = {
        success: true,
        tableCount: 10,
        functionsAvailable: true,
      }

      const mockTables: TableInfo[] = [
        { table: "users", exists: true, rowCount: 0 },
        { table: "user_plans", exists: true, rowCount: 0 },
        { table: "user_credits", exists: true, rowCount: 0 },
        { table: "generated_content", exists: true, rowCount: 0 },
        { table: "teams", exists: true, rowCount: 0 },
        { table: "team_members", exists: true, rowCount: 0 },
        { table: "integration_tokens", exists: true, rowCount: 0 },
        { table: "admin_users", exists: true, rowCount: 0 },
        { table: "subscription_plans", exists: true, rowCount: 3 },
        { table: "system_settings", exists: true, rowCount: 16 },
      ]

      setDatabaseCheck(mockResult)
      setTableDetails(mockTables)
    } catch (error) {
      setDatabaseCheck({
        success: false,
        error: "Failed to check database setup",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const runMigration = async () => {
    setIsChecking(true)
    try {
      // This would run your migration scripts
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // After migration, check the database again
      await checkDatabase()
    } catch (error) {
      console.error("Migration failed:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        OK
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Debug</h1>
          <p className="text-muted-foreground">Check and troubleshoot database setup issues</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={checkDatabase} disabled={isChecking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Refresh Check
          </Button>
          <Button onClick={runMigration} disabled={isChecking}>
            <Play className="h-4 w-4 mr-2" />
            Run Migration
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {databaseCheck ? (
                getStatusIcon(databaseCheck.success)
              ) : (
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              <span className="text-2xl font-bold">
                {databaseCheck ? (databaseCheck.success ? "Connected" : "Error") : "Checking..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{databaseCheck?.tableCount || 0}</div>
            <p className="text-xs text-muted-foreground">Core tables created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Functions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {databaseCheck ? (
                getStatusIcon(databaseCheck.functionsAvailable || false)
              ) : (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <span className="text-2xl font-bold">
                {databaseCheck ? (databaseCheck.functionsAvailable ? "Available" : "Error") : "Checking..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {tableDetails.find((table) => table.table === "users") ? (
                getStatusIcon(tableDetails.find((table) => table.table === "users")!.exists)
              ) : (
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              <span className="text-2xl font-bold">
                {tableDetails.find((table) => table.table === "users")
                  ? tableDetails.find((table) => table.table === "users")!.exists
                    ? "Exists"
                    : "Missing"
                  : "Checking..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {databaseCheck ? (
                getStatusIcon(databaseCheck.success)
              ) : (
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              <span className="text-2xl font-bold">
                {databaseCheck ? (databaseCheck.success ? "Secure" : "Error") : "Checking..."}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Details */}
      {tableDetails.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold">Table Details</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Exists</TableHead>
                <TableHead>Row Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableDetails.map((table) => (
                <TableRow key={table.table}>
                  <TableCell>{table.table}</TableCell>
                  <TableCell>{table.exists ? "Yes" : "No"}</TableCell>
                  <TableCell>{table.rowCount !== undefined ? table.rowCount : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Error Alert */}
      {databaseCheck && !databaseCheck.success && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{databaseCheck.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
