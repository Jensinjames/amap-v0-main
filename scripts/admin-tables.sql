-- Create admin-specific tables for enhanced functionality

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'support')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin impersonation sessions table
CREATE TABLE IF NOT EXISTS public.admin_impersonation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table (for admin management)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  credits INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- User status tracking (add status column to users table)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'inactive'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Email notifications queue
CREATE TABLE IF NOT EXISTS public.admin_email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_admin_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_name TEXT,
  template_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons and discounts table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  stripe_coupon_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_plans(id),
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON public.admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_token ON public.admin_impersonation_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_active ON public.admin_impersonation_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.admin_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, valid_until);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin tables (restrict to admin users only)
CREATE POLICY "Admin users can manage admin_users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can view audit log" ON public.admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin', 'support')
    )
  );

CREATE POLICY "Admin users can manage impersonation sessions" ON public.admin_impersonation_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can manage email queue" ON public.admin_email_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin', 'support')
    )
  );

CREATE POLICY "Admin users can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can manage coupons" ON public.coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('admin', 'super_admin')
    )
  );

-- Public can view active subscription plans
CREATE POLICY "Public can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Users can view their own coupon usage
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for admin operations
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'active_users', (SELECT COUNT(*) FROM public.users WHERE status = 'active'),
    'suspended_users', (SELECT COUNT(*) FROM public.users WHERE status = 'suspended'),
    'total_subscriptions', (SELECT COUNT(*) FROM public.user_plans),
    'active_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'active'),
    'trial_subscriptions', (SELECT COUNT(*) FROM public.user_plans WHERE status = 'trialing'),
    'total_content', (SELECT COUNT(*) FROM public.generated_content),
    'content_today', (
      SELECT COUNT(*) FROM public.generated_content 
      WHERE created_at >= CURRENT_DATE
    ),
    'total_credits_used', (SELECT COALESCE(SUM(credits_used), 0) FROM public.generated_content),
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
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user details for admin
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
        'created_at', u.created_at,
        'suspended_at', u.suspended_at,
        'suspension_reason', u.suspension_reason
      )
      FROM public.users u
      WHERE u.id = user_id_param
    ),
    'plan', (
      SELECT json_build_object(
        'plan_name', up.plan_name,
        'status', up.status,
        'credits_limit', up.credits_limit,
        'seat_count', up.seat_count,
        'trial_ends_at', up.trial_ends_at,
        'current_period_start', up.current_period_start,
        'current_period_end', up.current_period_end,
        'stripe_subscription_id', up.stripe_subscription_id
      )
      FROM public.user_plans up
      WHERE up.user_id = user_id_param
    ),
    'credits', (
      SELECT json_build_object(
        'monthly_limit', uc.monthly_limit,
        'credits_used', uc.credits_used,
        'reset_at', uc.reset_at
      )
      FROM public.user_credits uc
      WHERE uc.user_id = user_id_param
    ),
    'content_stats', (
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
    'team_members', (
      SELECT json_agg(
        json_build_object(
          'id', tm.id,
          'user_id', tm.user_id,
          'role', tm.role,
          'status', tm.status,
          'joined_at', tm.joined_at,
          'user_email', u.email,
          'user_name', u.first_name || ' ' || u.last_name
        )
      )
      FROM public.team_members tm
      JOIN public.users u ON tm.user_id = u.id
      WHERE tm.team_id IN (
        SELECT t.id FROM public.teams t WHERE t.owner_id = user_id_param
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'system', true),
  ('max_credits_per_user', '1000', 'Maximum credits a user can have', 'limits', false),
  ('default_trial_days', '7', 'Default trial period in days', 'billing', false),
  ('support_email', '"support@amap.com"', 'Support email address', 'contact', true),
  ('max_team_size', '50', 'Maximum team size across all plans', 'limits', false)
ON CONFLICT (key) DO NOTHING;
