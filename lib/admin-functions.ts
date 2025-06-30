import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export interface AdminUser {
  id: string
  user_id: string
  role: "super_admin" | "admin" | "support"
  permissions: Record<string, boolean>
  is_active: boolean
  created_at: string
  user?: {
    email: string
    first_name: string
    last_name: string
  }
}

export interface AdminAction {
  id: string
  admin_user_id: string
  target_user_id?: string
  action: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface FunctionTestResult {
  functionName: string
  success: boolean
  result?: any
  error?: string
  executionTime: number
}

// Test all admin functions
export async function testAdminFunctions(adminUserId: string): Promise<FunctionTestResult[]> {
  const results: FunctionTestResult[] = []

  // Test get_user_stats function
  const testUserId = adminUserId // Use admin user for testing
  results.push(
    await testFunction("get_user_stats", () => supabaseAdmin.rpc("get_user_stats", { user_uuid: testUserId })),
  )

  // Test check_user_credits function
  results.push(
    await testFunction("check_user_credits", () =>
      supabaseAdmin.rpc("check_user_credits", { user_uuid: testUserId, required_credits: 1 }),
    ),
  )

  // Test is_user_admin function
  results.push(
    await testFunction("is_user_admin", () => supabaseAdmin.rpc("is_user_admin", { user_uuid: adminUserId })),
  )

  // Test get_user_admin_role function
  results.push(
    await testFunction("get_user_admin_role", () =>
      supabaseAdmin.rpc("get_user_admin_role", { user_uuid: adminUserId }),
    ),
  )

  // Test get_admin_dashboard_stats function
  results.push(await testFunction("get_admin_dashboard_stats", () => supabaseAdmin.rpc("get_admin_dashboard_stats")))

  // Test get_user_activity function
  results.push(
    await testFunction("get_user_activity", () => supabaseAdmin.rpc("get_user_activity", { limit_count: 10 })),
  )

  // Test cleanup_expired_impersonation_sessions function
  results.push(
    await testFunction("cleanup_expired_impersonation_sessions", () =>
      supabaseAdmin.rpc("cleanup_expired_impersonation_sessions"),
    ),
  )

  // Test reset_monthly_credits function
  results.push(await testFunction("reset_monthly_credits", () => supabaseAdmin.rpc("reset_monthly_credits")))

  return results
}

async function testFunction(functionName: string, testFn: () => Promise<any>): Promise<FunctionTestResult> {
  const startTime = Date.now()

  try {
    const { data, error } = await testFn()
    const executionTime = Date.now() - startTime

    if (error) {
      return {
        functionName,
        success: false,
        error: error.message,
        executionTime,
      }
    }

    return {
      functionName,
      success: true,
      result: data,
      executionTime,
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    return {
      functionName,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    }
  }
}

// Check admin permissions
export async function checkAdminPermissions(userId: string): Promise<{
  isAdmin: boolean
  role?: string
  permissions: Record<string, boolean>
}> {
  try {
    const { data: adminUser, error } = await supabaseAdmin
      .from("admin_users")
      .select("role, permissions, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (error || !adminUser) {
      return { isAdmin: false, permissions: {} }
    }

    return {
      isAdmin: true,
      role: adminUser.role,
      permissions: adminUser.permissions || {},
    }
  } catch (error) {
    console.error("Error checking admin permissions:", error)
    return { isAdmin: false, permissions: {} }
  }
}

// Get all admin users
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select(`
        *,
        user:users(email, first_name, last_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching admin users:", error)
    throw error
  }
}

// Create admin user
export async function createAdminUser(
  userId: string,
  role: "super_admin" | "admin" | "support",
  permissions: Record<string, boolean> = {},
  createdBy: string,
): Promise<AdminUser> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .insert({
        user_id: userId,
        role,
        permissions,
        created_by: createdBy,
      })
      .select(`
        *,
        user:users(email, first_name, last_name)
      `)
      .single()

    if (error) {
      throw error
    }

    // Log the action
    await logAdminAction(createdBy, userId, "admin_user_created", {
      role,
      permissions,
    })

    return data
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw error
  }
}

// Update admin user
export async function updateAdminUser(
  adminId: string,
  updates: Partial<Pick<AdminUser, "role" | "permissions" | "is_active">>,
  updatedBy: string,
): Promise<AdminUser> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .update(updates)
      .eq("id", adminId)
      .select(`
        *,
        user:users(email, first_name, last_name)
      `)
      .single()

    if (error) {
      throw error
    }

    // Log the action
    await logAdminAction(updatedBy, data.user_id, "admin_user_updated", updates)

    return data
  } catch (error) {
    console.error("Error updating admin user:", error)
    throw error
  }
}

// Log admin action
export async function logAdminAction(
  adminUserId: string,
  targetUserId: string | null,
  action: string,
  details: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("admin_audit_log").insert({
      admin_user_id: adminUserId,
      target_user_id: targetUserId,
      action,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (error) {
      console.error("Error logging admin action:", error)
    }
  } catch (error) {
    console.error("Error logging admin action:", error)
  }
}

// Get admin audit log
export async function getAdminAuditLog(
  limit = 50,
  offset = 0,
  adminUserId?: string,
  targetUserId?: string,
  action?: string,
): Promise<AdminAction[]> {
  try {
    let query = supabaseAdmin
      .from("admin_audit_log")
      .select("*")
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1)

    if (adminUserId) {
      query = query.eq("admin_user_id", adminUserId)
    }

    if (targetUserId) {
      query = query.eq("target_user_id", targetUserId)
    }

    if (action) {
      query = query.eq("action", action)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching admin audit log:", error)
    throw error
  }
}

// Create impersonation token
export async function createImpersonationToken(
  adminUserId: string,
  targetUserId: string,
  durationMinutes = 60,
): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("create_impersonation_token", {
      admin_id: adminUserId,
      target_id: targetUserId,
      duration_minutes: durationMinutes,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error creating impersonation token:", error)
    throw error
  }
}

// Validate impersonation token
export async function validateImpersonationToken(token: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc("validate_impersonation_token", {
      token_string: token,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error validating impersonation token:", error)
    return null
  }
}

// End impersonation session
export async function endImpersonationSession(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("end_impersonation_session", {
      token_string: token,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error ending impersonation session:", error)
    return false
  }
}

// Test database permissions
export async function testDatabasePermissions(userId: string): Promise<{
  canReadUsers: boolean
  canReadAdminUsers: boolean
  canReadAuditLog: boolean
  canExecuteFunctions: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let canReadUsers = false
  let canReadAdminUsers = false
  let canReadAuditLog = false
  let canExecuteFunctions = false

  // Test reading users table
  try {
    const { error } = await supabaseAdmin.from("users").select("id").limit(1)
    canReadUsers = !error
    if (error) errors.push(`Users table: ${error.message}`)
  } catch (error) {
    errors.push(`Users table: ${error}`)
  }

  // Test reading admin_users table
  try {
    const { error } = await supabaseAdmin.from("admin_users").select("id").limit(1)
    canReadAdminUsers = !error
    if (error) errors.push(`Admin users table: ${error.message}`)
  } catch (error) {
    errors.push(`Admin users table: ${error}`)
  }

  // Test reading audit log
  try {
    const { error } = await supabaseAdmin.from("admin_audit_log").select("id").limit(1)
    canReadAuditLog = !error
    if (error) errors.push(`Audit log table: ${error.message}`)
  } catch (error) {
    errors.push(`Audit log table: ${error}`)
  }

  // Test executing functions
  try {
    const { error } = await supabaseAdmin.rpc("is_user_admin", { user_uuid: userId })
    canExecuteFunctions = !error
    if (error) errors.push(`Function execution: ${error.message}`)
  } catch (error) {
    errors.push(`Function execution: ${error}`)
  }

  return {
    canReadUsers,
    canReadAdminUsers,
    canReadAuditLog,
    canExecuteFunctions,
    errors,
  }
}
