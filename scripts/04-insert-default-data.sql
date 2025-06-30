-- Insert default data and system settings
-- Run this after all tables are created

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, credits, seats, features, stripe_product_id, stripe_price_id) VALUES
  (
    'Starter',
    'Perfect for individuals and small teams getting started with AI content generation',
    29.00,
    50,
    1,
    '["50 AI-generated content pieces per month", "Email marketing templates", "Social media posts", "Basic analytics", "Email support"]',
    'prod_starter_plan',
    'price_starter_monthly'
  ),
  (
    'Growth',
    'Ideal for growing businesses that need more content and team collaboration',
    79.00,
    200,
    5,
    '["200 AI-generated content pieces per month", "All Starter features", "Landing page templates", "Ad copy generation", "Team collaboration (5 seats)", "Priority support", "Advanced analytics"]',
    'prod_growth_plan',
    'price_growth_monthly'
  ),
  (
    'Scale',
    'For large teams and agencies requiring maximum content output and features',
    199.00,
    500,
    15,
    '["500 AI-generated content pieces per month", "All Growth features", "Blog post generation", "Sales funnel templates", "Team collaboration (15 seats)", "White-label options", "Custom integrations", "Dedicated account manager"]',
    'prod_scale_plan',
    'price_scale_monthly'
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  credits = EXCLUDED.credits,
  seats = EXCLUDED.seats,
  features = EXCLUDED.features,
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  updated_at = NOW();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'system', true),
  ('max_credits_per_user', '1000', 'Maximum credits a user can have', 'limits', false),
  ('default_trial_days', '7', 'Default trial period in days', 'billing', false),
  ('support_email', '"support@amap.com"', 'Support email address', 'contact', true),
  ('max_team_size', '50', 'Maximum team size across all plans', 'limits', false),
  ('openai_api_key', '""', 'OpenAI API key for content generation', 'integrations', false),
  ('stripe_publishable_key', '""', 'Stripe publishable key', 'billing', false),
  ('stripe_secret_key', '""', 'Stripe secret key', 'billing', false),
  ('email_from_address', '"noreply@amap.com"', 'Default from email address', 'email', false),
  ('email_from_name', '"AMAP Team"', 'Default from name for emails', 'email', false),
  ('app_name', '"AMAP"', 'Application name', 'general', true),
  ('app_description', '"AI-powered marketing content generation platform"', 'Application description', 'general', true),
  ('terms_url', '"/terms"', 'Terms of service URL', 'legal', true),
  ('privacy_url', '"/privacy"', 'Privacy policy URL', 'legal', true),
  ('max_content_length', '5000', 'Maximum content length in characters', 'limits', false),
  ('rate_limit_per_hour', '100', 'API rate limit per hour per user', 'limits', false)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_public = EXCLUDED.is_public,
  updated_at = NOW();

-- Insert sample coupon codes
INSERT INTO public.coupons (code, name, description, discount_type, discount_value, max_uses, valid_until, created_by) VALUES
  (
    'WELCOME20',
    'Welcome Discount',
    '20% off first month for new users',
    'percentage',
    20.00,
    1000,
    NOW() + INTERVAL '3 months',
    NULL
  ),
  (
    'SAVE50',
    'Limited Time Offer',
    '$50 off any annual plan',
    'fixed_amount',
    50.00,
    500,
    NOW() + INTERVAL '1 month',
    NULL
  )
ON CONFLICT (code) DO NOTHING;
