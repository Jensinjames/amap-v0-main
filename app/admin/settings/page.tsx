"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Settings,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Shield,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle,
  Key,
  Globe,
} from "lucide-react"

const systemSettings = [
  {
    key: "maintenance_mode",
    value: false,
    description: "Enable/disable maintenance mode",
    category: "system",
    type: "boolean",
    isPublic: true,
  },
  {
    key: "max_credits_per_user",
    value: 1000,
    description: "Maximum credits a user can have",
    category: "limits",
    type: "number",
    isPublic: false,
  },
  {
    key: "default_trial_days",
    value: 7,
    description: "Default trial period in days",
    category: "billing",
    type: "number",
    isPublic: false,
  },
  {
    key: "support_email",
    value: "support@amap.com",
    description: "Support email address",
    category: "contact",
    type: "string",
    isPublic: true,
  },
  {
    key: "max_team_size",
    value: 50,
    description: "Maximum team size across all plans",
    category: "limits",
    type: "number",
    isPublic: false,
  },
  {
    key: "openai_api_key",
    value: "sk-*********************",
    description: "OpenAI API key for content generation",
    category: "integrations",
    type: "password",
    isPublic: false,
  },
  {
    key: "stripe_webhook_secret",
    value: "whsec_*********************",
    description: "Stripe webhook endpoint secret",
    category: "integrations",
    type: "password",
    isPublic: false,
  },
]

const adminUsers = [
  {
    id: "1",
    email: "admin@amap.com",
    name: "Super Admin",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-11-28T14:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "support@amap.com",
    name: "Support User",
    role: "support",
    status: "active",
    lastLogin: "2024-11-28T10:15:00Z",
    createdAt: "2024-02-15T00:00:00Z",
  },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(systemSettings)
  const [editingSetting, setEditingSetting] = useState<any>(null)
  const [newAdminForm, setNewAdminForm] = useState({
    email: "",
    role: "admin",
  })
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings(settings.map((setting) => (setting.key === key ? { ...setting, value } : setting)))
    // TODO: Implement API call to update setting
    console.log("Updating setting:", key, value)
  }

  const handleSaveAllSettings = () => {
    // TODO: Implement bulk settings update
    console.log("Saving all settings:", settings)
  }

  const handleAddAdmin = () => {
    // TODO: Implement admin user creation
    console.log("Adding admin:", newAdminForm)
    setIsAddingAdmin(false)
    setNewAdminForm({ email: "", role: "admin" })
  }

  const handleRemoveAdmin = (adminId: string) => {
    // TODO: Implement admin user removal
    console.log("Removing admin:", adminId)
  }

  const getSettingsByCategory = (category: string) => {
    return settings.filter((setting) => setting.category === category)
  }

  const renderSettingInput = (setting: any) => {
    switch (setting.type) {
      case "boolean":
        return (
          <Switch checked={setting.value} onCheckedChange={(checked) => handleUpdateSetting(setting.key, checked)} />
        )
      case "number":
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, Number.parseInt(e.target.value))}
            className="w-32"
          />
        )
      case "password":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="password"
              value={setting.value}
              onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      default:
        return (
          <Input
            value={setting.value}
            onChange={(e) => handleUpdateSetting(setting.key, e.target.value)}
            className="flex-1"
          />
        )
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge variant="default">Super Admin</Badge>
      case "admin":
        return <Badge variant="secondary">Admin</Badge>
      case "support":
        return <Badge variant="outline">Support</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Manage system configuration, integrations, and admin access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Settings
          </Button>
          <Button onClick={handleSaveAllSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Core system settings and maintenance options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory("system").map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">
                        {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      {setting.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-4">{renderSettingInput(setting)}</div>
                </div>
              ))}

              {getSettingsByCategory("contact").map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">
                        {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      {setting.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-4">{renderSettingInput(setting)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>API keys and webhook configurations for external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  API keys and secrets are encrypted and only visible to super administrators.
                </AlertDescription>
              </Alert>

              {getSettingsByCategory("integrations").map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">
                        {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        <Key className="h-3 w-3 mr-1" />
                        Secret
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-4">{renderSettingInput(setting)}</div>
                </div>
              ))}

              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Integration Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OpenAI API</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stripe Webhooks</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <Badge variant="secondary">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Warning
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Limits
              </CardTitle>
              <CardDescription>Configure usage limits and quotas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory("limits")
                .concat(getSettingsByCategory("billing"))
                .map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium">
                        {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-4">{renderSettingInput(setting)}</div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Admin Users
                  </CardTitle>
                  <CardDescription>Manage administrative access and permissions</CardDescription>
                </div>
                <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Admin User</DialogTitle>
                      <DialogDescription>Grant administrative access to a user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="adminEmail">Email Address</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          placeholder="admin@example.com"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminRole">Role</Label>
                        <Select
                          value={newAdminForm.role}
                          onValueChange={(value) => setNewAdminForm({ ...newAdminForm, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingAdmin(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAdmin}>Add Admin</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{admin.name}</div>
                          <div className="text-sm text-muted-foreground">{admin.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(admin.lastLogin).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-transparent"
                            onClick={() => handleRemoveAdmin(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Authentication</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Require 2FA for Admins</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Session Timeout (minutes)</Label>
                      <Input type="number" defaultValue="60" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Max Login Attempts</Label>
                      <Input type="number" defaultValue="5" className="w-20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Access Control</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>IP Whitelist Enabled</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Audit Log Retention (days)</Label>
                      <Input type="number" defaultValue="90" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-lock Inactive Users</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Allowed IP Addresses</h4>
                <div className="space-y-2">
                  <Input placeholder="Enter IP address or range (e.g., 192.168.1.0/24)" />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">192.168.1.0/24</Badge>
                    <Badge variant="outline">10.0.0.0/8</Badge>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add IP Range
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                  Changes to security settings will affect all admin users. Ensure you have alternative access before
                  making changes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
