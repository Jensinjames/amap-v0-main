-- Create utility functions for the application
-- Run this after creating all tables and inserting default data

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_content', COALESCE(content_count, 0),
    'credits_used', COALESCE(credits_used, 0),
    'credits_remaining', COALESCE(credits_remaining, 0),
    'plan_name', COALESCE(plan_name, 'No Plan'),
    'team_count', COALESCE(team_count, 0),
    'last_activity', last_activity
  ) INTO result
  FROM (
    SELECT 
      (SELECT COUNT(*) FROM public.generated_content WHERE user_id = user_uuid) as content_count,
      (SELECT credits_used FROM public.user_credits WHERE user_id = user_uuid) as credits_used,
      (SELECT (monthly_limit - credits_used) FROM public.user_credits WHERE user_id = user_uuid) as credits_remaining,
      (SELECT plan_name FROM public.user_plans WHERE user_id = user_uuid) as plan_name,
      (SELECT COUNT(*) FROM public.team_members WHERE user_id = user_uuid AND status = 'active') as team_count,
      (SELECT MAX(created_at) FROM public.generated_content WHERE user_id = user_uuid) as last_activity
  ) stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has sufficient credits
CREATE OR REPLACE FUNCTION public.check_user_credits(user_uuid UUID, required_credits INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  available_credits INTEGER;
BEGIN
  SELECT (monthly_limit - credits_used) INTO available_credits
  FROM public.user_credits 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(available_credits, 0) >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits from user
CREATE OR REPLACE FUNCTION public.deduct_user_credits(user_uuid UUID, credits_to_deduct INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
  available_credits INTEGER;
BEGIN
  -- Get current credit usage
  SELECT credits_used, (monthly_limit - credits_used) INTO current_credits, available_credits
  FROM public.user_credits 
  WHERE user_id = user_uuid;
  
  -- Check if user has sufficient credits
  IF available_credits < credits_to_deduct THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_credits 
  SET credits_used = credits_used + credits_to_deduct,
      updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  UPDATE public.user_credits 
  SET credits_used = 0,
      reset_at = (date_trunc('month', NOW()) + INTERVAL '1 month'),
      updated_at = NOW()
  WHERE reset_at <= NOW();
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users WHERE status = 'active'),
    'total_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'active'),
    'total_content_generated', (SELECT COUNT(*) FROM public.generated_content),
    'total_credits_used', (SELECT SUM(credits_used) FROM public.user_credits),
    'monthly_revenue', (
      SELECT COALESCE(SUM(sp.price), 0)
      FROM public.user_plans up
      JOIN public.subscription_plans sp ON up.plan_name = sp.name
      WHERE up.status = 'active' AND sp.interval = 'month'
    ),
    'new_users_this_month', (
      SELECT COUNT(*) FROM public.users 
      WHERE created_at >= date_trunc('month', NOW())
    ),
    'content_generated_today', (
      SELECT COUNT(*) FROM public.generated_content 
      WHERE created_at >= date_trunc('day', NOW())
    ),
    'active_trials', (
      SELECT COUNT(*) FROM public.user_plans 
      WHERE status = 'trialing' AND trial_ends_at > NOW()
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity for admin
CREATE OR REPLACE FUNCTION public.get_user_activity(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  activity_type TEXT,
  activity_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email as user_email,
    'content_generated' as activity_type,
    CONCAT('Generated ', gc.content_type, ': ', gc.title) as activity_details,
    gc.created_at
  FROM public.generated_content gc
  JOIN public.users u ON gc.user_id = u.id
  ORDER BY gc.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired impersonation sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_impersonation_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  UPDATE public.admin_impersonation_sessions 
  SET is_active = false,
      ended_at = NOW()
  WHERE is_active = true 
    AND expires_at <= NOW();
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_id UUID,
  target_id UUID,
  action_name TEXT,
  action_details JSONB DEFAULT '{}'::JSONB,
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    target_user_id,
    action,
    details,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    target_id,
    action_name,
    action_details,
    ip_addr,
    user_agent_str
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's admin role
CREATE OR REPLACE FUNCTION public.get_user_admin_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.admin_users 
  WHERE user_id = user_uuid;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create impersonation token
CREATE OR REPLACE FUNCTION public.create_impersonation_token(
  admin_id UUID,
  target_id UUID,
  duration_minutes INTEGER DEFAULT 60
)
RETURNS TEXT AS $$
DECLARE
  token_string TEXT;
  expires_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a secure token
  token_string := encode(gen_random_bytes(32), 'base64');
  expires_time := NOW() + (duration_minutes || ' minutes')::INTERVAL;
  
  -- Insert the impersonation session
  INSERT INTO public.admin_impersonation_sessions (
    admin_user_id,
    target_user_id,
    token,
    expires_at
  ) VALUES (
    admin_id,
    target_id,
    token_string,
    expires_time
  );
  
  -- Log the action
  PERFORM public.log_admin_action(
    admin_id,
    target_id,
    'impersonation_started',
    json_build_object('expires_at', expires_time, 'duration_minutes', duration_minutes)::JSONB
  );
  
  RETURN token_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate impersonation token
CREATE OR REPLACE FUNCTION public.validate_impersonation_token(token_string TEXT)
RETURNS UUID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT target_user_id INTO target_user_id
  FROM public.admin_impersonation_sessions
  WHERE token = token_string
    AND is_active = true
    AND expires_at > NOW();
  
  RETURN target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end impersonation session
CREATE OR REPLACE FUNCTION public.end_impersonation_session(token_string TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  session_found BOOLEAN;
BEGIN
  UPDATE public.admin_impersonation_sessions
  SET is_active = false,
      ended_at = NOW()
  WHERE token = token_string
    AND is_active = true;
  
  GET DIAGNOSTICS session_found = FOUND;
  RETURN session_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_admin_role(UUID) TO authenticated;

-- Grant execute permissions for admin functions (these should be called via Edge Functions)
GRANT EXECUTE ON FUNCTION public.reset_monthly_credits() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_activity(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_impersonation_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_admin_action(UUID, UUID, TEXT, JSONB, INET, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_impersonation_token(UUID, UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_impersonation_token(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.end_impersonation_session(TEXT) TO service_role;
