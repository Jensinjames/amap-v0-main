-- Debug script to check if all tables exist and have correct structure
-- Run this to verify your database setup

-- Check if all required tables exist
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check table structures
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Check foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check triggers
SELECT 
  trigger_schema,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check functions
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Test basic queries to ensure tables are accessible
SELECT 'users table' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'user_plans table', COUNT(*) FROM public.user_plans
UNION ALL
SELECT 'user_credits table', COUNT(*) FROM public.user_credits
UNION ALL
SELECT 'generated_content table', COUNT(*) FROM public.generated_content
UNION ALL
SELECT 'teams table', COUNT(*) FROM public.teams
UNION ALL
SELECT 'team_members table', COUNT(*) FROM public.team_members
UNION ALL
SELECT 'integration_tokens table', COUNT(*) FROM public.integration_tokens
UNION ALL
SELECT 'admin_users table', COUNT(*) FROM public.admin_users
UNION ALL
SELECT 'subscription_plans table', COUNT(*) FROM public.subscription_plans
UNION ALL
SELECT 'system_settings table', COUNT(*) FROM public.system_settings;

-- Check if auth.users table exists (this is managed by Supabase)
SELECT 
  'auth.users exists' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
    THEN 'YES' 
    ELSE 'NO' 
  END as result;
