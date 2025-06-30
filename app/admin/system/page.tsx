"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Activity,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

const systemMetrics = {
  uptime: 99.97,
  responseTime: 245,
  errorRate: 0.03,
  activeUsers: 1247,
  apiCalls: 45672,
  databaseConnections: 23,
  cpuUsage: 34,
  memoryUsage: 67,
  diskUsage: 45,
  networkLatency: 12,
}

const services = [
  {
    name: "API Gateway",
    status: "healthy",
    uptime: 99.98,
    responseTime: 120,
    lastCheck: "30 seconds ago",
  },
  {
    name: "Database",
    status: "healthy",
    uptime: 99.95,
    responseTime: 45,
    lastCheck: "1 minute ago",
  },
  {
    name: "OpenAI Integration",
    status: "healthy",
    uptime: 99.87,
    responseTime: 1250,
    lastCheck: "2 minutes ago",
  },
  {
    name: "Stripe Webhooks",
    status: "healthy",
    uptime: 99.92,
    responseTime: 340,
    lastCheck: "1 minute ago",
  },
  {
    name: "Email Service",
    status: "warning",
    uptime: 98.45,
    responseTime: 890,
    lastCheck: "5 minutes ago",
  },
  {
    name: "File Storage",
    status: "healthy",
    uptime: 99.99,
    responseTime: 78,
    lastCheck: "30 seconds ago",
  },
]

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "High Memory Usage",
    message: "Memory usage has exceeded 65% for the past 10 minutes",
    timestamp: "5 minutes ago",
    resolved: false,
  },
  {
    id: 2,
    type: "info",
    title: "Scheduled Maintenance",
    message: "Database maintenance scheduled for tonight at 2:00 AM UTC",
    timestamp: "2 hours ago",
    resolved: false,
  },
  {
    id: 3,
    type: "error",
    title: "Email Service Degraded",
    message: "Email delivery experiencing delays, investigating issue",
    timestamp: "1 hour ago",
    resolved: true,
  },
]

export default function AdminSystemPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Healthy
          </Badge>
        )
      case "warning":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor system performance, uptime, and service health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.uptime}%</div>
            <Progress value={systemMetrics.uptime} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.responseTime}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -12ms from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.errorRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -0.01% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.2% from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
            <Progress value={systemMetrics.cpuUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
            <Progress value={systemMetrics.memoryUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.diskUsage}%</div>
            <Progress value={systemMetrics.diskUsage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.networkLatency}ms</div>
            <p className="text-xs text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Current status of all system services and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(service.status)}
                    <span className="font-medium">{service.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">{service.uptime}%</span> uptime
                  </div>
                  <div>
                    <span className="font-medium">{service.responseTime}ms</span> response
                  </div>
                  <div>Last check: {service.lastCheck}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                {getAlertIcon(alert.type)}
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <div className="flex items-center gap-2">
                    {alert.resolved && <Badge variant="outline">Resolved</Badge>}
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
          <CardDescription>Common system maintenance and configuration tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Database Maintenance</span>
              </div>
              <span className="text-xs text-muted-foreground">Run database optimization and cleanup</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="font-medium">Clear Cache</span>
              </div>
              <span className="text-xs text-muted-foreground">Clear application and CDN cache</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">System Configuration</span>
              </div>
              <span className="text-xs text-muted-foreground">Update system settings and parameters</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span className="font-medium">Backup System</span>
              </div>
              <span className="text-xs text-muted-foreground">Create full system backup</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Performance Tuning</span>
              </div>
              <span className="text-xs text-muted-foreground">Optimize system performance</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Health Check</span>
              </div>
              <span className="text-xs text-muted-foreground">Run comprehensive system health check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
