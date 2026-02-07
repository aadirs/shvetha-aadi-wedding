-- Wedding Gift Collection Pots - Supabase Schema
-- Run this SQL in your Supabase Dashboard → SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Pots table
CREATE TABLE IF NOT EXISTS pots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  story_text TEXT,
  cover_image_url TEXT,
  goal_amount_paise BIGINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Pot items table
CREATE TABLE IF NOT EXISTS pot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id UUID NOT NULL REFERENCES pots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 3) Contribution sessions table
CREATE TABLE IF NOT EXISTS contribution_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  donor_message TEXT,
  total_amount_paise BIGINT NOT NULL,
  fee_amount_paise BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed')),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- 4) Allocations table
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES contribution_sessions(id) ON DELETE CASCADE,
  pot_id UUID NOT NULL REFERENCES pots(id),
  pot_item_id UUID REFERENCES pot_items(id),
  amount_paise BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed'))
);

-- 5) Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_event_id TEXT,
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pots_slug ON pots(slug);
CREATE INDEX IF NOT EXISTS idx_pots_active ON pots(is_active);
CREATE INDEX IF NOT EXISTS idx_pot_items_pot_id ON pot_items(pot_id);
CREATE INDEX IF NOT EXISTS idx_allocations_session_id ON allocations(session_id);
CREATE INDEX IF NOT EXISTS idx_allocations_pot_id ON allocations(pot_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON allocations(status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON contribution_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_razorpay_order ON contribution_sessions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_gateway ON webhook_events(gateway_event_id);

-- Disable RLS for simplicity (service key bypasses anyway)
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "service_role_all_pots" ON pots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_pot_items" ON pot_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_sessions" ON contribution_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_allocations" ON allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_webhook" ON webhook_events FOR ALL USING (true) WITH CHECK (true);
