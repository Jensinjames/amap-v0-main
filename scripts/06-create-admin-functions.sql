-- Create comprehensive admin functions for user management and testing
-- Run this after creating all tables

-- Function to create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_first_name TEXT DEFAULT '',
  user_last_name TEXT DEFAULT '',
  admin_role admin_role DEFAULT 'admin',
  admin_permissions JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  auth_user_id UUID;
  result JSON;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users (simulated - in production this would be handled by Supabase Auth)
  -- For testing purposes, we'll create a mock auth user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) VALUES (
    new_user_id,
    user_email,
    crypt('temp_password_123', gen_salt('bf')), -- Temporary password
    NOW(),
    NOW(),
    NOW(),
    json_build_object(
      'first_name', user_first_name,
      'last_name', user_last_name
    )::jsonb
  );
  
  -- The trigger will automatically create the public.users record
  -- Wait a moment and then update admin status
  
  -- Create admin user record
  INSERT INTO public.admin_users (
    user_id,
    role,
    permissions,
    is_active,
    created_at
  ) VALUES (
    new_user_id,
    admin_role,
    admin_permissions,
    true,
    NOW()
  );
  
  -- Return the created user info
  SELECT json_build_object(
    'user_id', new_user_id,
    'email', user_email,
    'first_name', user_first_name,
    'last_name', user_last_name,
    'role', admin_role,
    'permissions', admin_permissions,
    'created_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin user details
CREATE OR REPLACE FUNCTION get_admin_user_details(admin_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user', json_build_object(
      'id', u.id,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'status', u.status,
      'email_verified', u.email_verified,
      'created_at', u.created_at
    ),
    'admin', json_build_object(
      'id', au.id,
      'role', au.role,
      'permissions', au.permissions,
      'is_active', au.is_active,
      'created_at', au.created_at
    )
  ) INTO result
  FROM public.users u
  JOIN public.admin_users au ON u.id = au.user_id
  WHERE u.id = admin_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all admin users
CREATE OR REPLACE FUNCTION get_all_admin_users()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'user_id', u.id,
      'email', u.email,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'status', u.status,
      'role', au.role,
      'permissions', au.permissions,
      'is_active', au.is_active,
      'created_at', au.created_at
    )
  ) INTO result
  FROM public.users u
  JOIN public.admin_users au ON u.id = au.user_id
  ORDER BY au.created_at DESC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create impersonation token
CREATE OR REPLACE FUNCTION create_impersonation_token(
  admin_id UUID,
  target_id UUID,
  duration_minutes INTEGER DEFAULT 60
)
RETURNS TEXT AS $$
DECLARE
  token_string TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verify admin has permission to impersonate
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = admin_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'User is not an active admin';
  END IF;
  
  -- Generate secure token
  token_string := encode(gen_random_bytes(32), 'base64');
  expires_at := NOW() + (duration_minutes || ' minutes')::INTERVAL;
  
  -- Store impersonation session
  INSERT INTO public.admin_impersonation_sessions (
    admin_user_id,
    target_user_id,
    token,
    expires_at,
    is_active
  ) VALUES (
    admin_id,
    target_id,
    token_string,
    expires_at,
    true
  );
  
  -- Log the impersonation start
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    target_user_id,
    action,
    details
  ) VALUES (
    admin_id,
    target_id,
    'impersonation_started',
    json_build_object(
      'token_expires_at', expires_at,
      'duration_minutes', duration_minutes
    )
  );
  
  RETURN token_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate impersonation token
CREATE OR REPLACE FUNCTION validate_impersonation_token(token_string TEXT)
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
CREATE OR REPLACE FUNCTION end_impersonation_session(token_string TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.admin_impersonation_sessions
  WHERE token = token_string AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- End the session
  UPDATE public.admin_impersonation_sessions
  SET is_active = false, ended_at = NOW()
  WHERE token = token_string;
  
  -- Log the impersonation end
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    target_user_id,
    action,
    details
  ) VALUES (
    session_record.admin_user_id,
    session_record.target_user_id,
    'impersonation_ended',
    json_build_object(
      'ended_at', NOW(),
      'token', token_string
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired impersonation sessions
CREATE OR REPLACE FUNCTION cleanup_expired_impersonation_sessions()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  UPDATE public.admin_impersonation_sessions
  SET is_active = false, ended_at = NOW()
  WHERE is_active = true AND expires_at < NOW();
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM public.users),
      'active', (SELECT COUNT(*) FROM public.users WHERE status = 'active'),
      'suspended', (SELECT COUNT(*) FROM public.users WHERE status = 'suspended'),
      'new_this_week', (
        SELECT COUNT(*) FROM public.users 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      )
    ),
    'admins', json_build_object(
      'total', (SELECT COUNT(*) FROM public.admin_users WHERE is_active = true),
      'super_admins', (
        SELECT COUNT(*) FROM public.admin_users 
        WHERE role = 'super_admin' AND is_active = true
      ),
      'admins', (
        SELECT COUNT(*) FROM public.admin_users 
        WHERE role = 'admin' AND is_active = true
      ),
      'support', (
        SELECT COUNT(*) FROM public.admin_users 
        WHERE role = 'support' AND is_active = true
      )
    ),
    'activity', json_build_object(
      'total_actions', (SELECT COUNT(*) FROM public.admin_audit_log),
      'actions_today', (
        SELECT COUNT(*) FROM public.admin_audit_log 
        WHERE timestamp >= CURRENT_DATE
      ),
      'active_impersonations', (
        SELECT COUNT(*) FROM public.admin_impersonation_sessions 
        WHERE is_active = true AND expires_at > NOW()
      )
    ),
    'system', json_build_object(
      'settings_count', (SELECT COUNT(*) FROM public.system_settings),
      'active_coupons', (
        SELECT COUNT(*) FROM public.coupons 
        WHERE is_active = true AND (valid_until IS NULL OR valid_until > NOW())
      ),
      'subscription_plans', (
        SELECT COUNT(*) FROM public.subscription_plans 
        WHERE is_active = true AND deleted_at IS NULL
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user admin role
CREATE OR REPLACE FUNCTION get_user_admin_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.admin_users
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity (for admin monitoring)
CREATE OR REPLACE FUNCTION get_user_activity(limit_count INTEGER DEFAULT 50)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', aal.id,
      'admin_user', json_build_object(
        'id', au.id,
        'email', u_admin.email,
        'name', u_admin.first_name || ' ' || u_admin.last_name
      ),
      'target_user', CASE 
        WHEN aal.target_user_id IS NOT NULL THEN
          json_build_object(
            'id', aal.target_user_id,
            'email', u_target.email,
            'name', u_target.first_name || ' ' || u_target.last_name
          )
        ELSE NULL
      END,
      'action', aal.action,
      'details', aal.details,
      'timestamp', aal.timestamp,
      'ip_address', aal.ip_address
    )
  ) INTO result
  FROM public.admin_audit_log aal
  JOIN public.users u_admin ON aal.admin_user_id = u_admin.id
  LEFT JOIN public.users u_target ON aal.target_user_id = u_target.id
  LEFT JOIN public.admin_users au ON aal.admin_user_id = au.user_id
  ORDER BY aal.timestamp DESC
  LIMIT limit_count;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_admin_user TO service_role;
GRANT EXECUTE ON FUNCTION get_admin_user_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION create_impersonation_token TO authenticated;
GRANT EXECUTE ON FUNCTION validate_impersonation_token TO authenticated;
GRANT EXECUTE ON FUNCTION end_impersonation_session TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_impersonation_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity TO authenticated;
