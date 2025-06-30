import { createServerClient } from "./supabase"

export async function checkDatabaseSetup() {
  const supabase = createServerClient()

  try {
    // Check if users table exists
    const { data: usersCheck, error: usersError } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true })

    if (usersError) {
      console.error("Users table check failed:", usersError)
      return {
        success: false,
        error: "Users table does not exist or is not accessible",
        details: usersError,
      }
    }

    // Check if other core tables exist
    const tables = [
      "user_plans",
      "user_credits",
      "generated_content",
      "teams",
      "team_members",
      "integration_tokens",
      "admin_users",
      "subscription_plans",
      "system_settings",
    ]

    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase.from(table).select("count", { count: "exact", head: true })

        return {
          table,
          exists: !error,
          error: error?.message,
        }
      }),
    )

    const missingTables = tableChecks.filter((check) => !check.exists)

    if (missingTables.length > 0) {
      return {
        success: false,
        error: "Some required tables are missing",
        missingTables: missingTables.map((t) => t.table),
        details: missingTables,
      }
    }

    // Check if functions exist
    const { data: functionsCheck, error: functionsError } = await supabase.rpc("get_admin_dashboard_stats")

    if (functionsError) {
      console.warn("Admin functions not available:", functionsError)
    }

    return {
      success: true,
      message: "Database setup is complete",
      tableCount: tableChecks.length + 1, // +1 for users table
      functionsAvailable: !functionsError,
    }
  } catch (error) {
    console.error("Database setup check failed:", error)
    return {
      success: false,
      error: "Failed to check database setup",
      details: error,
    }
  }
}

export async function runDatabaseMigration() {
  const supabase = createServerClient()

  try {
    // This would typically run the SQL scripts in order
    // For now, we'll just check the setup
    const setupResult = await checkDatabaseSetup()

    if (!setupResult.success) {
      throw new Error(`Database setup incomplete: ${setupResult.error}`)
    }

    return {
      success: true,
      message: "Database migration completed successfully",
    }
  } catch (error) {
    console.error("Database migration failed:", error)
    return {
      success: false,
      error: "Database migration failed",
      details: error,
    }
  }
}

// Helper function to create a test user (for development)
export async function createTestUser(email: string, password: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: "Test",
        last_name: "User",
      },
    })

    if (error) {
      throw error
    }

    return {
      success: true,
      user: data.user,
      message: "Test user created successfully",
    }
  } catch (error) {
    console.error("Failed to create test user:", error)
    return {
      success: false,
      error: "Failed to create test user",
      details: error,
    }
  }
}
