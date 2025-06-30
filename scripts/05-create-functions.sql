-- Create utility functions for admin operations and analytics
-- Run this after all tables and data are created

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'active_users', (SELECT COUNT(*) FROM public.users WHERE status = 'active'),
    'suspended_users', (SELECT COUNT(*) FROM public.users WHERE status = 'suspended'),
    'pending_users', (SELECT COUNT(*) FROM public.users WHERE status = 'pending'),
    'total_subscriptions', (SELECT COUNT(*) FROM public.user_plans),
    'active_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'active'),
    'trial_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'trialing'),
    'canceled_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'canceled'),
    'total_content', (SELECT COUNT(*) FROM public.generated_content),
    'content_today', (
      SELECT COUNT(*) FROM public.generated_content 
      WHERE created_at >= CURRENT_DATE
    ),
    'content_this_week', (
      SELECT COUNT(*) FROM public.generated_content 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'content_this_month', (
      SELECT COUNT(*) FROM public.generated_content 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'total_credits_used', (SELECT COALESCE(SUM(credits_used), 0) FROM public.generated_content),
    'credits_used_today', (
      SELECT COALESCE(SUM(credits_used), 0) FROM public.generated_content 
      WHERE created_at >= CURRENT_DATE
    ),
    'credits_used_this_week', (
      SELECT COALESCE(SUM(credits_used), 0) FROM public.generated_content 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'credits_used_this_month', (
      SELECT COALESCE(SUM(credits_used), 0) FROM public.generated_content 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'revenue_this_month', (
      SELECT COALESCE(SUM(
        CASE up.plan_name
          WHEN 'starter' THEN 29
          WHEN 'growth' THEN 79
          WHEN 'scale' THEN 199
          ELSE 0
        END
      ), 0)
      FROM public.user_plans up
      WHERE up.status IN ('active', 'trialing')
      AND up.current_period_start >= date_trunc('month', CURRENT_DATE)
    ),
    'recent_signups', (
      SELECT COUNT(*) FROM public.users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'plan_distribution', (
      SELECT json_object_agg(plan_name, plan_count)
      FROM (
        SELECT plan_name, COUNT(*) as plan_count
        FROM public.user_plans
        WHERE status IN ('active', 'trialing')
        GROUP BY plan_name
      ) t
    ),
    'content_type_distribution', (
      SELECT json_object_agg(content_type, type_count)
      FROM (
        SELECT content_type, COUNT(*) as type_count
        FROM public.generated_content
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
        GROUP BY content_type
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get detailed user information for admin
CREATE OR REPLACE FUNCTION get_admin_user_details(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user', (
      SELECT json_build_object(
        'id', u.id,
        'email', u.email,
        'first_name', u.first_name,
        'last_name', u.last_name,
        'status', u.status,
        'email_verified', u.email_verified,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'suspended_at', u.suspended_at,
        'suspension_reason', u.suspension_reason
      )
      FROM public.users u
      WHERE u.id = user_id_param
    ),
    'plan', (
      SELECT json_build_object(
        'id', up.id,
        'plan_name', up.plan_name,
        'status', up.status,
        'credits_limit', up.credits_limit,
        'seat_count', up.seat_count,
        'trial_ends_at', up.trial_ends_at,
        'current_period_start', up.current_period_start,
        'current_period_end', up.current_period_end,
        'stripe_customer_id', up.stripe_customer_id,
        'stripe_subscription_id', up.stripe_subscription_id,
        'created_at', up.created_at
      )
      FROM public.user_plans up
      WHERE up.user_id = user_id_param
    ),
    'credits', (
      SELECT json_build_object(
        'id', uc.id,
        'monthly_limit', uc.monthly_limit,
        'credits_used', uc.credits_used,
        'reset_at', uc.reset_at,
        'usage_percentage', ROUND((uc.credits_used::DECIMAL / uc.monthly_limit::DECIMAL) * 100, 2)
      )
      FROM public.user_credits uc
      WHERE uc.user_id = user_id_param
    ),
    'content_stats', (
      SELECT json_build_object(
        'total_generated', COUNT(*),
        'total_credits_used', COALESCE(SUM(credits_used), 0),
        'avg_credits_per_content', ROUND(AVG(credits_used), 2),
        'last_generated', MAX(created_at),
        'by_type', json_object_agg(content_type, type_stats)
      )
      FROM (
        SELECT 
          content_type,
          json_build_object(
            'count', COUNT(*),
            'credits_used', SUM(credits_used),
            'avg_credits', ROUND(AVG(credits_used), 2)
          ) as type_stats,
          credits_used
        FROM public.generated_content
        WHERE user_id = user_id_param
        GROUP BY content_type, credits_used
      ) t
    ),
    'team_info', (
      SELECT json_build_object(
        'owned_teams', (
          SELECT json_agg(
            json_build_object(
              'id', t.id,
              'name', t.name,
              'created_at', t.created_at,
              'member_count', (
                SELECT COUNT(*) FROM public.team_members tm 
                WHERE tm.team_id = t.id AND tm.status = 'active'
              )
            )
          )
          FROM public.teams t
          WHERE t.owner_id = user_id_param
        ),
        'team_memberships', (
          SELECT json_agg(
            json_build_object(
              'team_id', tm.team_id,
              'team_name', t.name,
              'role', tm.role,
              'status', tm.status,
              'joined_at', tm.joined_at
            )
          )
          FROM public.team_members tm
          JOIN public.teams t ON tm.team_id = t.id
          WHERE tm.user_id = user_id_param
        )
      )
    ),
    'recent_content', (
      SELECT json_agg(
        json_build_object(
          'id', gc.id,
          'content_type', gc.content_type,
          'title', gc.title,
          'credits_used', gc.credits_used,
          'status', gc.status,
          'created_at', gc.created_at
        )
      )
      FROM (
        SELECT * FROM public.generated_content
        WHERE user_id = user_id_param
        ORDER BY created_at DESC
        LIMIT 10
      ) gc
    ),
    'integrations', (
      SELECT json_agg(
        json_build_object(
          'provider', it.provider,
          'is_active', it.is_active,
          'created_at', it.created_at
        )
      )
      FROM public.integration_tokens it
      WHERE it.user_id = user_id_param
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user list with pagination and filtering
CREATE OR REPLACE FUNCTION get_admin_users_list(
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  plan_filter TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  where_clause TEXT := '';
  order_clause TEXT;
BEGIN
  -- Build WHERE clause
  IF search_term IS NOT NULL AND search_term != '' THEN
    where_clause := where_clause || ' AND (u.email ILIKE ''%' || search_term || '%'' OR u.first_name ILIKE ''%' || search_term || '%'' OR u.last_name ILIKE ''%' || search_term || '%'')';
  END IF;
  
  IF status_filter IS NOT NULL AND status_filter != '' THEN
    where_clause := where_clause || ' AND u.status = ''' || status_filter || '''';
  END IF;
  
  IF plan_filter IS NOT NULL AND plan_filter != '' THEN
    where_clause := where_clause || ' AND up.plan_name = ''' || plan_filter || '''';
  END IF;
  
  -- Build ORDER clause
  order_clause := 'ORDER BY ' || sort_by || ' ' || sort_order;
  
  -- Get total count
  EXECUTE 'SELECT COUNT(*) FROM public.users u LEFT JOIN public.user_plans up ON u.id = up.user_id WHERE 1=1' || where_clause
  INTO total_count;
  
  -- Get paginated results
  EXECUTE 'SELECT json_agg(
    json_build_object(
      ''id'', u.id,
      ''email'', u.email,
      ''first_name'', u.first_name,
      ''last_name'', u.last_name,
      ''status'', u.status,
      ''email_verified'', u.email_verified,
      ''created_at'', u.created_at,
      ''plan_name'', up.plan_name,
      ''plan_status'', up.status,
      ''credits_used'', uc.credits_used,
      ''credits_limit'', uc.monthly_limit,
      ''last_activity'', (
        SELECT MAX(created_at) FROM public.generated_content gc WHERE gc.user_id = u.id
      )
    )
  )
  FROM public.users u
  LEFT JOIN public.user_plans up ON u.id = up.user_id
  LEFT JOIN public.user_credits uc ON u.id = uc.user_id
  WHERE 1=1' || where_clause || ' ' || order_clause || ' LIMIT ' || page_size || ' OFFSET ' || page_offset
  INTO result;
  
  -- Return combined result
  SELECT json_build_object(
    'users', COALESCE(result, '[]'::json),
    'total_count', total_count,
    'page_size', page_size,
    'page_offset', page_offset,
    'has_more', (page_offset + page_size) < total_count
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription analytics
CREATE OR REPLACE FUNCTION get_subscription_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'period', json_build_object(
      'start_date', start_date,
      'end_date', end_date
    ),
    'new_subscriptions', (
      SELECT COUNT(*) FROM public.user_plans
      WHERE created_at::DATE BETWEEN start_date AND end_date
    ),
    'canceled_subscriptions', (
      SELECT COUNT(*) FROM public.user_plans
      WHERE status = 'canceled' 
      AND updated_at::DATE BETWEEN start_date AND end_date
    ),
    'trial_conversions', (
      SELECT COUNT(*) FROM public.user_plans
      WHERE status = 'active' 
      AND trial_ends_at IS NOT NULL
      AND updated_at::DATE BETWEEN start_date AND end_date
    ),
    'revenue_by_plan', (
      SELECT json_object_agg(plan_name, revenue)
      FROM (
        SELECT 
          up.plan_name,
          COUNT(*) * CASE up.plan_name
            WHEN 'starter' THEN 29
            WHEN 'growth' THEN 79
            WHEN 'scale' THEN 199
            ELSE 0
          END as revenue
        FROM public.user_plans up
        WHERE up.status IN ('active', 'trialing')
        AND up.current_period_start::DATE BETWEEN start_date AND end_date
        GROUP BY up.plan_name
      ) t
    ),
    'churn_rate', (
      SELECT ROUND(
        (SELECT COUNT(*)::DECIMAL FROM public.user_plans WHERE status = 'canceled' AND updated_at::DATE BETWEEN start_date AND end_date) /
        NULLIF((SELECT COUNT(*)::DECIMAL FROM public.user_plans WHERE created_at::DATE < start_date), 0) * 100,
        2
      )
    ),
    'daily_signups', (
      SELECT json_object_agg(signup_date, signup_count)
      FROM (
        SELECT 
          created_at::DATE as signup_date,
          COUNT(*) as signup_count
        FROM public.user_plans
        WHERE created_at::DATE BETWEEN start_date AND end_date
        GROUP BY created_at::DATE
        ORDER BY created_at::DATE
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired impersonation sessions
CREATE OR REPLACE FUNCTION cleanup_expired_impersonation_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE public.admin_impersonation_sessions
  SET is_active = false, ended_at = NOW()
  WHERE is_active = true 
  AND expires_at < NOW();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset user credits (for monthly reset)
CREATE OR REPLACE FUNCTION reset_user_credits()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  UPDATE public.user_credits
  SET 
    credits_used = 0,
    reset_at = date_trunc('month', NOW()) + INTERVAL '1 month',
    updated_at = NOW()
  WHERE reset_at <= NOW();
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users for dashboard functions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_users_list(INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_analytics(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_impersonation_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_credits() TO authenticated;
