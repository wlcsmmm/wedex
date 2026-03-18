-- ============================================================
-- Wedex — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── card_types (shared, read-only for users) ───────────────
CREATE TABLE card_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('miles', 'cashback')),
  program TEXT CHECK (program IN ('krisflyer', 'asiamiles', 'thankyou')),
  reward_rules JSONB NOT NULL DEFAULT '[]',
  fallback_rate NUMERIC NOT NULL,
  image_url TEXT
);

-- ─── weddings ───────────────────────────────────────────────
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE,
  total_budget NUMERIC NOT NULL,
  venue_tier TEXT CHECK (venue_tier IN ('luxury_hotel', 'premium_hotel', 'restaurant', 'garden', 'other')),
  guest_count INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── wedding_members ────────────────────────────────────────
CREATE TABLE wedding_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'partner', 'bride_family', 'groom_family')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, user_id)
);

-- ─── budgets ────────────────────────────────────────────────
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  allocated_pct NUMERIC,
  UNIQUE(wedding_id, category)
);

-- ─── credit_cards ───────────────────────────────────────────
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  member_id UUID REFERENCES wedding_members(id),
  card_type_id UUID REFERENCES card_types(id),
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── vendors ────────────────────────────────────────────────
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_quoted NUMERIC NOT NULL,
  total_nett NUMERIC,
  funded_by TEXT DEFAULT 'couple' CHECK (funded_by IN ('couple', 'bride_family', 'groom_family', 'other')),
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fully_paid', 'cancelled')),
  payment_strategy JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── expenses ───────────────────────────────────────────────
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'SGD',
  merchant_name TEXT,
  category TEXT,
  card_id UUID REFERENCES credit_cards(id),
  payment_type TEXT CHECK (payment_type IN ('deposit', 'installment', 'balance', 'full')),
  funded_by TEXT DEFAULT 'couple' CHECK (funded_by IN ('couple', 'bride_family', 'groom_family', 'other')),
  source TEXT NOT NULL CHECK (source IN ('manual', 'voice', 'receipt', 'email')),
  matched_payment_index INTEGER,
  confidence NUMERIC,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ang_baos ───────────────────────────────────────────────
CREATE TABLE ang_baos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  table_number INTEGER,
  amount NUMERIC NOT NULL,
  guest_tier TEXT CHECK (guest_tier IN ('close_family', 'extended_family', 'friend', 'colleague')),
  is_projection BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ang_baos ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_types ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a member of a wedding
CREATE OR REPLACE FUNCTION is_wedding_member(p_wedding_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM wedding_members
    WHERE wedding_id = p_wedding_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- card_types: anyone authenticated can read
CREATE POLICY "card_types_read" ON card_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- weddings: members can read; owner can insert/update
CREATE POLICY "weddings_select" ON weddings
  FOR SELECT USING (is_wedding_member(id));

CREATE POLICY "weddings_insert" ON weddings
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "weddings_update" ON weddings
  FOR UPDATE USING (is_wedding_member(id));

-- wedding_members: members can read their own wedding's members
CREATE POLICY "members_select" ON wedding_members
  FOR SELECT USING (is_wedding_member(wedding_id));

CREATE POLICY "members_insert" ON wedding_members
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_wedding_member(wedding_id));

-- budgets: members can read/write
CREATE POLICY "budgets_all" ON budgets
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- credit_cards: members can read/write
CREATE POLICY "credit_cards_all" ON credit_cards
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- vendors: members can read/write
CREATE POLICY "vendors_all" ON vendors
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- expenses: members can read/write
CREATE POLICY "expenses_all" ON expenses
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- ang_baos: members can read/write
CREATE POLICY "ang_baos_all" ON ang_baos
  USING (is_wedding_member(wedding_id))
  WITH CHECK (is_wedding_member(wedding_id));

-- ============================================================
-- Triggers: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER weddings_updated_at BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
