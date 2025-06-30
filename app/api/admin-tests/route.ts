import { NextResponse } from "next/server"
import {
  testAdminFunctions,
  checkAdminPermissions,
  testDatabasePermissions,
  getAdminUsers,
  getAdminAuditLog,
} from "@/lib/admin-functions"

/**
 * GET /api/admin-tests?userId=UUID
 *
 * Runs all admin verification tests on the server (where the
 * SUPABASE_SERVICE_ROLE_KEY is available) and returns a JSON payload
 * the client can render.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") ?? ""

  // Run all tests / look-ups in parallel
  const [functionResults, permissions, dbPermissions, adminUsers, auditLog] = await Promise.all([
    testAdminFunctions(userId),
    checkAdminPermissions(userId),
    testDatabasePermissions(userId),
    getAdminUsers(),
    getAdminAuditLog(20),
  ])

  return NextResponse.json({
    functionResults,
    permissions,
    dbPermissions,
    adminUsers,
    auditLog,
  })
}
