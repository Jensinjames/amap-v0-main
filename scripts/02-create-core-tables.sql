-- Create core application tables
-- Run this after creating the users table

-- Create enum types
CREATE TYPE plan_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_type AS ENUM ('email', 'social_post', 'blog_post', 'ad_copy', 'product_description');
CREATE TYPE team_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE team_member_status AS ENUM ('active', 'pending', 'inactive');

-- User Plans Table
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'starter',
  status plan_status DEFAULT 'active',
  credits_limit INTEGER DEFAULT 50,
  seat_count INTEGER DEFAULT 1,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Credits Table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  monthly_limit INTEGER DEFAULT 50,
  credits_used INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Generated Content Table
CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type content_type NOT NULL,
  prompt TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  credits_used INTEGER DEFAULT 1,
  status content_status DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role team_member_role DEFAULT 'member',
  status team_member_status DEFAULT 'pending',
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Integration Tokens Table
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_token TEXT NOT NULL,
  token_metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON public.user_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_customer ON public.user_plans(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_reset_at ON public.user_credits(reset_at);

CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON public.generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON public.generated_content(created_at);

CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON public.integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_provider ON public.integration_tokens(provider);

-- Enable Row Level Security
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plans
CREATE POLICY "Users can view own plan" ON public.user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own plan" ON public.user_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_credits
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for generated_content
CREATE POLICY "Users can view own content" ON public.generated_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content" ON public.generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content" ON public.generated_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content" ON public.generated_content
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Users can view teams they own or are members of" ON public.teams
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = teams.id AND user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams" ON public.teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams" ON public.teams
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Users can view team memberships" ON public.team_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_members.team_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_members.team_id AND owner_id = auth.uid()
    )
  );

-- RLS Policies for integration_tokens
CREATE POLICY "Users can manage own integration tokens" ON public.integration_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER handle_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_integration_tokens_updated_at
  BEFORE UPDATE ON public.integration_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to automatically create user plan and credits
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default user plan
  INSERT INTO public.user_plans (user_id, plan_name, status, credits_limit, seat_count)
  VALUES (NEW.id, 'starter', 'trialing', 50, 1);
  
  -- Create user credits
  INSERT INTO public.user_credits (user_id, monthly_limit, credits_used)
  VALUES (NEW.id, 50, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_setup
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_credits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_tokens TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
