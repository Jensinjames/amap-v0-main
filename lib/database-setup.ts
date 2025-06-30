import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export interface TableInfo {
  name: string
  exists: boolean
  rowCount: number
  columns: string[]
  indexes: string[]
  policies: string[]
  triggers: string[]
}

export interface DatabaseStatus {
  isHealthy: boolean
  tables: TableInfo[]
  functions: string[]
  errors: string[]
  lastChecked: Date
}

export async function checkDatabaseHealth(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    isHealthy: true,
    tables: [],
    functions: [],
    errors: [],
    lastChecked: new Date(),
  }

  try {
    // Check if all required tables exist
    const requiredTables = [
      "users",
      "user_plans",
      "user_credits",
      "generated_content",
      "teams",
      "team_members",
      "integration_tokens",
      "admin_users",
      "admin_audit_log",
      "admin_impersonation_sessions",
      "subscription_plans",
      "admin_email_queue",
      "system_settings",
      "coupons",
      "coupon_usage",
    ]

    for (const tableName of requiredTables) {
      const tableInfo: TableInfo = {
        name: tableName,
        exists: false,
        rowCount: 0,
        columns: [],
        indexes: [],
        policies: [],
        triggers: [],
      }

      try {
        // Check if table exists and get basic info
        const { data: tableExists, error: tableError } = await supabaseAdmin
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .eq("table_name", tableName)
          .single()

        if (tableExists && !tableError) {
          tableInfo.exists = true

          // Get row count
          const { count, error: countError } = await supabaseAdmin
            .from(tableName)
            .select("*", { count: "exact", head: true })

          if (!countError) {
            tableInfo.rowCount = count || 0
          }

          // Get column information
          const { data: columns, error: columnsError } = await supabaseAdmin
            .from("information_schema.columns")
            .select("column_name, data_type, is_nullable")
            .eq("table_schema", "public")
            .eq("table_name", tableName)
            .order("ordinal_position")

          if (!columnsError && columns) {
            tableInfo.columns = columns.map(
              (col) => `${col.column_name} (${col.data_type}${col.is_nullable === "YES" ? ", nullable" : ""})`,
            )
          }

          // Get indexes
          const { data: indexes, error: indexesError } = await supabaseAdmin
            .from("pg_indexes")
            .select("indexname, indexdef")
            .eq("schemaname", "public")
            .eq("tablename", tableName)

          if (!indexesError && indexes) {
            tableInfo.indexes = indexes.map((idx) => idx.indexname)
          }

          // Get RLS policies
          const { data: policies, error: policiesError } = await supabaseAdmin
            .from("pg_policies")
            .select("policyname, cmd, permissive")
            .eq("schemaname", "public")
            .eq("tablename", tableName)

          if (!policiesError && policies) {
            tableInfo.policies = policies.map(
              (policy) => `${policy.policyname} (${policy.cmd}, ${policy.permissive ? "permissive" : "restrictive"})`,
            )
          }

          // Get triggers
          const { data: triggers, error: triggersError } = await supabaseAdmin
            .from("information_schema.triggers")
            .select("trigger_name, action_timing, event_manipulation")
            .eq("trigger_schema", "public")
            .eq("event_object_table", tableName)

          if (!triggersError && triggers) {
            tableInfo.triggers = triggers.map(
              (trigger) => `${trigger.trigger_name} (${trigger.action_timing} ${trigger.event_manipulation})`,
            )
          }
        } else {
          status.errors.push(`Table '${tableName}' does not exist`)
          status.isHealthy = false
        }
      } catch (error) {
        status.errors.push(`Error checking table '${tableName}': ${error}`)
        status.isHealthy = false
      }

      status.tables.push(tableInfo)
    }

    // Check if required functions exist
    const requiredFunctions = [
      "get_user_stats",
      "check_user_credits",
      "deduct_user_credits",
      "reset_monthly_credits",
      "get_admin_dashboard_stats",
      "get_user_activity",
      "cleanup_expired_impersonation_sessions",
      "log_admin_action",
      "is_user_admin",
      "get_user_admin_role",
      "create_impersonation_token",
      "validate_impersonation_token",
      "end_impersonation_session",
    ]

    const { data: functions, error: functionsError } = await supabaseAdmin
      .from("information_schema.routines")
      .select("routine_name")
      .eq("routine_schema", "public")
      .in("routine_name", requiredFunctions)

    if (!functionsError && functions) {
      status.functions = functions.map((f) => f.routine_name)

      // Check if all required functions exist
      const missingFunctions = requiredFunctions.filter(
        (required) => !functions.some((f) => f.routine_name === required),
      )

      if (missingFunctions.length > 0) {
        status.errors.push(`Missing functions: ${missingFunctions.join(", ")}`)
        status.isHealthy = false
      }
    } else {
      status.errors.push("Could not check database functions")
      status.isHealthy = false
    }
  } catch (error) {
    status.errors.push(`Database health check failed: ${error}`)
    status.isHealthy = false
  }

  return status
}

export async function runDatabaseMigration(scriptName: string): Promise<{ success: boolean; error?: string }> {
  try {
    // This would typically read the SQL file and execute it
    // For now, we'll return a placeholder response
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.from("users").select("count").limit(1)

    if (error) {
      return { connected: false, error: error.message }
    }

    return { connected: true }
  } catch (error) {
    return { connected: false, error: String(error) }
  }
}

export async function getTableRelationships(): Promise<
  Array<{
    table: string
    column: string
    referencedTable: string
    referencedColumn: string
  }>
> {
  try {
    const { data, error } = await supabaseAdmin
      .from("information_schema.key_column_usage")
      .select(`
        table_name,
        column_name,
        constraint_name
      `)
      .eq("table_schema", "public")

    if (error) {
      console.error("Error fetching relationships:", error)
      return []
    }

    // This is a simplified version - in practice you'd need to join with
    // constraint_column_usage to get the referenced table/column
    return []
  } catch (error) {
    console.error("Error getting table relationships:", error)
    return []
  }
}

export async function validateRLSPolicies(): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = []

  try {
    const { data: policies, error } = await supabaseAdmin
      .from("pg_policies")
      .select("schemaname, tablename, policyname, cmd")
      .eq("schemaname", "public")

    if (error) {
      issues.push(`Could not fetch RLS policies: ${error.message}`)
      return { valid: false, issues }
    }

    // Check that all tables have appropriate policies
    const requiredTables = ["users", "user_plans", "user_credits", "generated_content"]
    const tablesWithPolicies = new Set(policies?.map((p) => p.tablename) || [])

    for (const table of requiredTables) {
      if (!tablesWithPolicies.has(table)) {
        issues.push(`Table '${table}' is missing RLS policies`)
      }
    }

    return { valid: issues.length === 0, issues }
  } catch (error) {
    issues.push(`RLS validation failed: ${error}`)
    return { valid: false, issues }
  }
}
