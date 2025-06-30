-- Insert sample users (these would normally be created through Supabase Auth)
-- Note: In production, users are created via Supabase Auth, this is just for development

-- Insert sample user plans
INSERT INTO public.user_plans (user_id, plan_name, credits_limit, seat_count, status, trial_ends_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'growth', 200, 5, 'trialing', NOW() + INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000002', 'starter', 50, 1, 'active', NULL),
  ('00000000-0000-0000-0000-000000000003', 'scale', 500, 15, 'active', NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample user credits
INSERT INTO public.user_credits (user_id, monthly_limit, credits_used) VALUES
  ('00000000-0000-0000-0000-000000000001', 200, 45),
  ('00000000-0000-0000-0000-000000000002', 50, 23),
  ('00000000-0000-0000-0000-000000000003', 500, 127)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample generated content
INSERT INTO public.generated_content (user_id, content_type, title, prompt, generated_content, credits_used) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'email',
    'Welcome Series for SaaS',
    'Create a 3-email welcome series for a SaaS project management tool targeting small business owners',
    '{"emails": [{"subject": "Welcome to ProjectPro!", "content": "Hi there! Welcome to ProjectPro..."}, {"subject": "Getting Started Guide", "content": "Now that you are signed up..."}], "metadata": {"generated_at": "2024-01-15T10:30:00Z", "credits_used": 3}}',
    3
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'ad',
    'Facebook Ad Campaign',
    'Create Facebook ad copy for a productivity app targeting busy entrepreneurs',
    '{"ads": [{"headline": "Stop Wasting Time on Busy Work", "primary_text": "Discover the productivity app that saves entrepreneurs 2+ hours daily...", "cta": "Try Free for 14 Days"}], "metadata": {"generated_at": "2024-01-14T15:45:00Z", "credits_used": 2}}',
    2
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'social',
    'LinkedIn Post Series',
    'Create LinkedIn posts about remote work productivity tips',
    '{"posts": [{"content": "🏠 Working from home? Here are 5 productivity hacks that changed my life...", "hashtags": ["#RemoteWork", "#Productivity", "#WorkFromHome"]}], "metadata": {"generated_at": "2024-01-13T09:15:00Z", "credits_used": 1}}',
    1
  );

-- Insert sample teams
INSERT INTO public.teams (id, name, owner_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Marketing Team', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Content Creators', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample team members
INSERT INTO public.team_members (team_id, user_id, role, status, joined_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner', 'active', NOW() - INTERVAL '30 days'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin', 'active', NOW() - INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'member', 'pending', NOW() - INTERVAL '2 days')
ON CONFLICT (team_id, user_id) DO NOTHING;
