-- Create admin-specific tables
-- Run this after creating core tables

-- Create enum types for admin functionality
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'support');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed', 'bounced');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount');

-- Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role admin_role DEFAULT 'support',
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES public.users(id),
  target_user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Impersonation Sessions Table
CREATE TABLE IF NOT EXISTS public.admin_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES public.users(id),
  target_user_id UUID NOT NULL REFERENCES public.users(id),
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Subscription Plans Table (Admin managed)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  credits INTEGER NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  interval TEXT DEFAULT 'month',
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Admin Email Queue Table
CREATE TABLE IF NOT EXISTS public.admin_email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.users(id),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_name TEXT,
  template_data JSONB DEFAULT '{}',
  status email_status DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type coupon_type NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_plans TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon Usage Table
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON public.admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp);

CREATE INDEX IF NOT EXISTS idx_admin_impersonation_token ON public.admin_impersonation_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_active ON public.admin_impersonation_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_impersonation_expires ON public.admin_impersonation_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON public.subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product ON public.subscription_plans(stripe_product_id);

CREATE INDEX IF NOT EXISTS idx_admin_email_queue_recipient ON public.admin_email_queue(recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_email_queue_status ON public.admin_email_queue(status);
CREATE INDEX IF NOT EXISTS idx_admin_email_queue_scheduled ON public.admin_email_queue(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON public.system_settings(is_public);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users (only admins can view/manage)
CREATE POLICY "Only admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only super admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
    )
  );

-- RLS Policies for admin_audit_log (only admins can view)
CREATE POLICY "Only admins can view audit log" ON public.admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- RLS Policies for admin_impersonation_sessions (only admins can manage)
CREATE POLICY "Only admins can manage impersonation sessions" ON public.admin_impersonation_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- RLS Policies for subscription_plans (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Only admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- RLS Policies for admin_email_queue (only admins can manage)
CREATE POLICY "Only admins can manage email queue" ON public.admin_email_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- RLS Policies for system_settings (public read for public settings, admin write)
CREATE POLICY "Anyone can view public system settings" ON public.system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Only admins can view all system settings" ON public.system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- RLS Policies for coupons (public read for active, admin write)
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Only admins can manage coupons" ON public.coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- RLS Policies for coupon_usage (users can view own usage, admins can view all)
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can view all coupon usage" ON public.coupon_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Users can insert own coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER handle_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT SELECT ON public.admin_impersonation_sessions TO authenticated;
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT ON public.admin_email_queue TO authenticated;
GRANT SELECT ON public.system_settings TO authenticated;
GRANT SELECT ON public.coupons TO authenticated;
GRANT SELECT, INSERT ON public.coupon_usage TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
