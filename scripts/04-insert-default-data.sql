-- Insert default data for the application
-- Run this after creating all tables

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, currency, interval, credits, seats, features, is_active) VALUES
('Starter', 'Perfect for individuals and small teams getting started with AI marketing', 29.00, 'USD', 'month', 50, 1, 
 '["Email campaigns", "Social media posts", "Basic templates", "Email support"]', true),
('Growth', 'Ideal for growing businesses that need more content and team collaboration', 79.00, 'USD', 'month', 200, 5, 
 '["Everything in Starter", "Landing pages", "Ad copy", "Team collaboration", "Priority support", "Custom templates"]', true),
('Scale', 'For large teams and agencies requiring unlimited content generation', 199.00, 'USD', 'month', 1000, 25, 
 '["Everything in Growth", "Unlimited content", "Advanced analytics", "White-label options", "Dedicated support", "API access"]', true),
('Starter Annual', 'Perfect for individuals and small teams getting started with AI marketing (Annual)', 290.00, 'USD', 'year', 50, 1, 
 '["Email campaigns", "Social media posts", "Basic templates", "Email support", "2 months free"]', true),
('Growth Annual', 'Ideal for growing businesses that need more content and team collaboration (Annual)', 790.00, 'USD', 'year', 200, 5, 
 '["Everything in Starter", "Landing pages", "Ad copy", "Team collaboration", "Priority support", "Custom templates", "2 months free"]', true),
('Scale Annual', 'For large teams and agencies requiring unlimited content generation (Annual)', 1990.00, 'USD', 'year', 1000, 25, 
 '["Everything in Growth", "Unlimited content", "Advanced analytics", "White-label options", "Dedicated support", "API access", "2 months free"]', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('app_name', '"AMAP - AI Marketing Assistant Platform"', 'Application name displayed throughout the platform', 'general', true),
('app_version', '"1.0.0"', 'Current application version', 'general', true),
('maintenance_mode', 'false', 'Enable maintenance mode to restrict access', 'system', false),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'limits', false),
('default_credits_limit', '50', 'Default monthly credits for new users', 'limits', false),
('trial_period_days', '7', 'Number of days for trial period', 'billing', false),
('openai_model', '"gpt-4"', 'Default OpenAI model for content generation', 'integrations', false),
('openai_max_tokens', '2000', 'Maximum tokens per OpenAI request', 'integrations', false),
('stripe_webhook_secret', '""', 'Stripe webhook endpoint secret', 'integrations', false),
('email_from_address', '"noreply@amap.ai"', 'Default from email address', 'email', false),
('email_from_name', '"AMAP Team"', 'Default from name for emails', 'email', false),
('support_email', '"support@amap.ai"', 'Support email address', 'general', true),
('terms_url', '"https://amap.ai/terms"', 'Terms of service URL', 'legal', true),
('privacy_url', '"https://amap.ai/privacy"', 'Privacy policy URL', 'legal', true),
('admin_notification_email', '"admin@amap.ai"', 'Email for admin notifications', 'admin', false),
('session_timeout_minutes', '60', 'Session timeout in minutes', 'security', false),
('password_min_length', '8', 'Minimum password length', 'security', false),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security', false),
('lockout_duration_minutes', '15', 'Account lockout duration in minutes', 'security', false),
('enable_2fa', 'false', 'Enable two-factor authentication requirement', 'security', false),
('allowed_domains', '[]', 'Allowed email domains for registration (empty = all)', 'security', false)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert sample coupons
INSERT INTO public.coupons (code, name, description, discount_type, discount_value, currency, max_uses, valid_from, valid_until, is_active) VALUES
('WELCOME20', 'Welcome Discount', '20% off first month for new users', 'percentage', 20.00, 'USD', 1000, NOW(), NOW() + INTERVAL '3 months', true),
('SAVE50', 'Limited Time Offer', '$50 off annual plans', 'fixed_amount', 50.00, 'USD', 500, NOW(), NOW() + INTERVAL '1 month', true),
('EARLYBIRD', 'Early Bird Special', '30% off for early adopters', 'percentage', 30.00, 'USD', 100, NOW(), NOW() + INTERVAL '2 weeks', true),
('STUDENT15', 'Student Discount', '15% off for students', 'percentage', 15.00, 'USD', NULL, NOW(), NOW() + INTERVAL '1 year', true)
ON CONFLICT (code) DO NOTHING;

-- Create a sample admin user (you'll need to update this with a real user ID after creating an account)
-- This is commented out because it requires a real user ID from auth.users
-- INSERT INTO public.admin_users (user_id, role, permissions) VALUES
-- ('your-user-id-here', 'super_admin', '{"all": true}');

-- Insert sample content types and templates (for future use)
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('content_types', '["email", "ad", "landing", "social", "blog", "funnel"]', 'Available content types for generation', 'content', false),
('email_templates', '{"welcome": "Welcome to AMAP!", "trial_ending": "Your trial is ending soon", "subscription_cancelled": "Your subscription has been cancelled"}', 'Email templates for notifications', 'email', false),
('generation_prompts', '{"email": "Create a professional email campaign about {topic} for {audience}", "ad": "Write compelling ad copy for {product} targeting {audience}", "landing": "Create a high-converting landing page for {product}", "social": "Write engaging social media posts about {topic}", "blog": "Write a comprehensive blog post about {topic}", "funnel": "Create a complete sales funnel for {product}"}', 'Default prompts for content generation', 'content', false)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
