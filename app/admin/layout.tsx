"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Database,
  TestTube,
  ChevronDown,
  LogOut,
  User,
  AlertTriangle,
  CheckCircle,
  Wrench,
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface AdminUser {
  role: string
  permissions: Record<string, boolean>
  is_active: boolean
}

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Setup", url: "/admin/setup", icon: Wrench },
    ],
  },
  {
    title: "User Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "Content & System",
    items: [
      { title: "Content", url: "/admin/content", icon: FileText },
      { title: "System", url: "/admin/system", icon: Database },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Development",
    items: [
      { title: "Functions", url: "/admin/functions", icon: Shield },
      { title: "Testing", url: "/admin/test", icon: TestTube },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      // Check if user is admin (simplified check)
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("role, permissions, is_active")
        .limit(1)
        .single()

      if (!adminError && adminData) {
        setAdminUser(adminData)
      }

      // Check if setup is complete by verifying key tables exist
      const { data: setupData, error: setupError } = await supabase.rpc("get_admin_dashboard_stats")

      setSetupComplete(!setupError)
    } catch (error) {
      console.error("Failed to check admin status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      super_admin: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      support: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    }

    return (
      <Badge variant="outline" className={roleColors[role as keyof typeof roleColors] || ""}>
        {role.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin interface...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">AMAP SaaS</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {!setupComplete && (
              <div className="px-2 mb-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Setup Required</AlertTitle>
                  <AlertDescription className="text-xs">
                    Complete the setup process to enable all features.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {navigationItems.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" alt="Admin" />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Admin User</span>
                        {adminUser && (
                          <span className="text-xs text-muted-foreground">{adminUser.role.replace("_", " ")}</span>
                        )}
                      </div>
                      <ChevronDown className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <span>Admin Account</span>
                        {adminUser && getRoleBadge(adminUser.role)}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 ml-auto">
              {setupComplete ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Setup Complete
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Setup Required
                </Badge>
              )}
              {adminUser && getRoleBadge(adminUser.role)}
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
