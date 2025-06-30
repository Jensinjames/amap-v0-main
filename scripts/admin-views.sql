-- Create admin-specific views and functions for better data management

-- View for user analytics
CREATE OR REPLACE VIEW admin_user_analytics AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.created_at as join_date,
  up.plan_name,
  up.status as subscription_status,
  up.trial_ends_at,
  uc.credits_used,
  uc.monthly_limit,
  COALESCE(content_stats.total_content, 0) as total_content_generated,
  COALESCE(content_stats.total_credits_used, 0) as total_credits_spent,
  CASE 
    WHEN u.created_at > NOW() - INTERVAL '7 days' THEN 'new'
    WHEN up.status = 'trialing' THEN 'trial'
    WHEN up.status = 'active' THEN 'active'
    WHEN up.status = 'past_due' THEN 'past_due'
    ELSE 'inactive'
  END as user_category
FROM public.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
LEFT JOIN public.user_credits uc ON u.id = uc.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_content,
    SUM(credits_used) as total_credits_used
  FROM public.generated_content 
  GROUP BY user_id
) content_stats ON u.id = content_stats.user_id;

-- View for subscription analytics
CREATE OR REPLACE VIEW admin_subscription_analytics AS
SELECT 
  up.id,
  u.email,
  u.first_name || ' ' || u.last_name as customer_name,
  up.plan_name,
  up.status,
  up.credits_limit,
  up.seat_count,
  up.stripe_customer_id,
  up.stripe_subscription_id,
  up.trial_ends_at,
  up.current_period_start,
  up.current_period_end,
  up.created_at,
  CASE up.plan_name
    WHEN 'starter' THEN 29
    WHEN 'growth' THEN 79
    WHEN 'scale' THEN 199
    ELSE 0
  END as monthly_amount,
  EXTRACT(DAYS FROM (up.current_period_end - up.current_period_start)) as billing_cycle_days
FROM public.user_plans up
JOIN public.users u ON up.user_id = u.id;

-- View for content analytics
CREATE OR REPLACE VIEW admin_content_analytics AS
SELECT 
  gc.id,
  gc.content_type,
  gc.title,
  u.email as user_email,
  gc.credits_used,
  gc.status,
  gc.created_at,
  LENGTH(gc.generated_content::text) as content_size_bytes,
  CASE gc.content_type
    WHEN 'email' THEN 'Email Sequence'
    WHEN 'ad' THEN 'Ad Copy'
    WHEN 'landing' THEN 'Landing Page'
    WHEN 'social' THEN 'Social Posts'
    WHEN 'blog' THEN 'Blog Content'
    WHEN 'funnel' THEN 'Sales Funnel'
    ELSE gc.content_type
  END as content_type_display
FROM public.generated_content gc
JOIN public.users u ON gc.user_id = u.id;

-- Function to get system statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'active_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'active'),
    'trial_users', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'trialing'),
    'total_content_generated', (SELECT COUNT(*) FROM public.generated_content),
    'total_credits_used', (SELECT COALESCE(SUM(credits_used), 0) FROM public.generated_content),
    'monthly_revenue', (
      SELECT COALESCE(SUM(
        CASE plan_name
          WHEN 'starter' THEN 29
          WHEN 'growth' THEN 79
          WHEN 'scale' THEN 199
          ELSE 0
        END
      ), 0)
      FROM public.user_plans 
      WHERE status IN ('active', 'trialing')
    ),
    'content_by_type', (
      SELECT json_object_agg(content_type, count)
      FROM (
        SELECT content_type, COUNT(*) as count
        FROM public.generated_content
        GROUP BY content_type
      ) t
    ),
    'users_by_plan', (
      SELECT json_object_agg(plan_name, count)
      FROM (
        SELECT plan_name, COUNT(*) as count
        FROM public.user_plans
        GROUP BY plan_name
      ) t
    ),
    'recent_signups', (
      SELECT COUNT(*)
      FROM public.users
      WHERE created_at > NOW() - INTERVAL '7 days'
    ),
    'churn_rate', (
      SELECT ROUND(
        (SELECT COUNT(*) FROM public.user_plans WHERE status = 'canceled' AND updated_at > NOW() - INTERVAL '30 days')::numeric /
        NULLIF((SELECT COUNT(*) FROM public.user_plans WHERE created_at <= NOW() - INTERVAL '30 days'), 0) * 100,
        2
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_info', (
      SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.first_name || ' ' || u.last_name,
        'join_date', u.created_at,
        'plan', up.plan_name,
        'status', up.status,
        'credits_used', uc.credits_used,
        'credits_limit', uc.monthly_limit
      )
      FROM public.users u
      LEFT JOIN public.user_plans up ON u.id = up.user_id
      LEFT JOIN public.user_credits uc ON u.id = uc.user_id
      WHERE u.id = user_id_param
    ),
    'content_summary', (
      SELECT json_build_object(
        'total_generated', COUNT(*),
        'total_credits_used', COALESCE(SUM(credits_used), 0),
        'by_type', json_object_agg(content_type, type_count)
      )
      FROM (
        SELECT 
          content_type,
          COUNT(*) as type_count,
          credits_used
        FROM public.generated_content
        WHERE user_id = user_id_param
        GROUP BY content_type, credits_used
      ) t
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'type', content_type,
          'title', title,
          'created_at', created_at,
          'credits_used', credits_used
        )
      )
      FROM public.generated_content
      WHERE user_id = user_id_param
      ORDER BY created_at DESC
      LIMIT 10
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_user_plans_status ON public.user_plans(status);
CREATE INDEX IF NOT EXISTS idx_admin_user_plans_plan_name ON public.user_plans(plan_name);
CREATE INDEX IF NOT EXISTS idx_admin_content_created_at ON public.generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_content_type ON public.generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_admin_content_status ON public.generated_content(status);

-- Grant permissions for admin functions (adjust role as needed)
-- GRANT EXECUTE ON FUNCTION get_admin_stats() TO admin_role;
-- GRANT EXECUTE ON FUNCTION get_user_activity_summary(UUID) TO admin_role;
-- GRANT SELECT ON admin_user_analytics TO admin_role;
-- GRANT SELECT ON admin_subscription_analytics TO admin_role;
-- GRANT SELECT ON admin_content_analytics TO admin_role;
