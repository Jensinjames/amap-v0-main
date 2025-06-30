-- Create a test admin user for interface testing
-- Run this script to set up a test admin account

-- First, let's create the test admin user
SELECT create_admin_user(
  'admin@amap.com',
  'Test',
  'Admin',
  'super_admin',
  '{
    "can_manage_users": true,
    "can_manage_admins": true,
    "can_impersonate": true,
    "can_view_audit_log": true,
    "can_manage_settings": true,
    "can_manage_subscriptions": true
  }'::jsonb
) as test_admin_created;

-- Create a support user for testing different permission levels
SELECT create_admin_user(
  'support@amap.com',
  'Test',
  'Support',
  'support',
  '{
    "can_view_users": true,
    "can_view_audit_log": true,
    "can_send_emails": true
  }'::jsonb
) as test_support_created;

-- Create a regular admin user
SELECT create_admin_user(
  'manager@amap.com',
  'Test',
  'Manager',
  'admin',
  '{
    "can_manage_users": true,
    "can_view_audit_log": true,
    "can_manage_subscriptions": true,
    "can_impersonate": true
  }'::jsonb
) as test_manager_created;

-- Insert some default system settings for testing
INSERT INTO public.system_settings (category, key, value, description, is_public) VALUES
  ('system', 'maintenance_mode', 'false', 'Enable/disable maintenance mode', true),
  ('system', 'max_login_attempts', '5', 'Maximum login attempts before lockout', false),
  ('system', 'session_timeout', '3600', 'Session timeout in seconds', false),
  ('limits', 'max_credits_per_user', '1000', 'Maximum credits a user can have', false),
  ('limits', 'max_team_size', '50', 'Maximum team size across all plans', false),
  ('limits', 'max_content_per_day', '100', 'Maximum content generations per day', false),
  ('billing', 'default_trial_days', '7', 'Default trial period in days', false),
  ('billing', 'grace_period_days', '3', 'Grace period for overdue payments', false),
  ('contact', 'support_email', 'support@amap.com', 'Support email address', true),
  ('contact', 'admin_email', 'admin@amap.com', 'Admin email address', false),
  ('integrations', 'openai_model', 'gpt-4', 'Default OpenAI model to use', false),
  ('integrations', 'max_tokens', '2000', 'Maximum tokens per request', false)
ON CONFLICT (category, key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public;

-- Insert some default subscription plans for testing
INSERT INTO public.subscription_plans (
  name, display_name, description, price, credits, seats, features, 
  is_active, is_popular, interval, trial_days
) VALUES
  (
    'starter',
    'Starter Plan',
    'Perfect for individuals getting started with AI content generation',
    29.00,
    50,
    1,
    '["50 credits per month", "Email support", "Basic templates", "Content history"]'::jsonb,
    true,
    false,
    'month',
    7
  ),
  (
    'growth',
    'Growth Plan',
    'Ideal for growing businesses and content creators',
    79.00,
    200,
    3,
    '["200 credits per month", "Priority support", "Advanced templates", "Team collaboration", "Analytics dashboard"]'::jsonb,
    true,
    true,
    'month',
    14
  ),
  (
    'scale',
    'Scale Plan',
    'For large teams and enterprises with high-volume needs',
    199.00,
    500,
    10,
    '["500 credits per month", "24/7 support", "Custom templates", "Advanced team management", "API access", "White-label options"]'::jsonb,
    true,
    false,
    'month',
    14
  )
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  credits = EXCLUDED.credits,
  seats = EXCLUDED.seats,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  trial_days = EXCLUDED.trial_days;

-- Create some test coupons
INSERT INTO public.coupons (
  code, name, description, type, value, max_uses, is_active, 
  valid_from, valid_until, applicable_plans
) VALUES
  (
    'WELCOME20',
    '20% Welcome Discount',
    'Welcome discount for new users',
    'percentage',
    20.00,
    100,
    true,
    NOW(),
    NOW() + INTERVAL '30 days',
    ARRAY['starter', 'growth']
  ),
  (
    'SAVE50',
    '$50 Off Scale Plan',
    'Fixed discount for Scale plan subscribers',
    'fixed_amount',
    50.00,
    50,
    true,
    NOW(),
    NOW() + INTERVAL '60 days',
    ARRAY['scale']
  ),
  (
    'EXPIRED10',
    'Expired 10% Discount',
    'Test expired coupon',
    'percentage',
    10.00,
    10,
    false,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '30 days',
    ARRAY['starter', 'growth', 'scale']
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  value = EXCLUDED.value,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active,
  valid_until = EXCLUDED.valid_until;

-- Log the admin user creation
INSERT INTO public.admin_audit_log (
  admin_user_id,
  target_user_id,
  action,
  details
) 
SELECT 
  au.user_id,
  au.user_id,
  'test_admin_setup',
  json_build_object(
    'setup_type', 'initial_test_data',
    'created_at', NOW(),
    'role', au.role
  )
FROM public.admin_users au
JOIN public.users u ON au.user_id = u.id
WHERE u.email IN ('admin@amap.com', 'support@amap.com', 'manager@amap.com');

-- Display the created admin users
SELECT 
  u.email,
  u.first_name,
  u.last_name,
  au.role,
  au.permissions,
  au.created_at
FROM public.users u
JOIN public.admin_users au ON u.id = au.user_id
WHERE u.email IN ('admin@amap.com', 'support@amap.com', 'manager@amap.com')
ORDER BY au.created_at;

-- Show system stats
SELECT get_admin_dashboard_stats() as dashboard_stats;
