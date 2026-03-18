# Wedex — AI Wedding Budget Planner & Expense Tracker
## Claude Code Build Prompt

### What is Wedex?
An AI-powered wedding finance app for Singapore couples. Budget-first architecture: couples plan their wedding spending, assign credit cards to each vendor payment for miles optimization, and the app tracks actual transactions against the plan.

**One-liner:** "Plan what you'll spend. Wedex watches and makes every dollar work harder."

**Target user:** Engaged couples in Singapore, aged 25–38, planning a S$30K–$85K wedding over 6–18 months. Hold 3–6 credit cards between them. Currently tracking budget in Google Sheets.

---

### Tech Stack
- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + Real-time subscriptions)
- **AI:** Claude Haiku via Anthropic API (expense parsing, vendor extraction)
- **Hosting:** Vercel
- **PWA:** next-pwa for installable mobile experience
- **Auth:** Supabase Auth (magic link + Google OAuth)

---

### Architecture: Budget-First

The budget plan is the app's brain. Everything derives from comparing reality against the plan.

**Phase A: Plan** (progressive capture, over weeks)
- Session 1 (onboarding): Total budget → wedding date + guest count → AI-suggested category split → add credit cards → invite partner
- Session 2+ (ongoing): Add vendors as booked, with quoted amounts, payment schedules, and card assignments
- The plan grows over time — couples don't have all vendor info upfront

**Phase B: Track** (passive + active, ongoing)
- Transactions enter via: NLP text input, voice (Web Speech API), receipt scan (Claude Vision), email forwarding
- App matches transactions against planned vendor payments (deterministic, no AI needed for matching)
- Card check on every transaction: did they use the planned card? If not, alert with miles impact

**Phase C: Intelligence** (derived from plan vs actual)
- Budget health by category
- Vendor tracker: paid vs balance, next payment due
- Miles dashboard: total earned, by program, honeymoon equivalency
- Net cost: budget − ang bao projection − parent contributions
- Weekly AI digest (Claude Sonnet, cron job)

---

### Data Model (Core Tables)

```sql
-- The wedding workspace
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE,
  total_budget NUMERIC NOT NULL,
  venue_tier TEXT, -- 'luxury_hotel' | 'premium_hotel' | 'restaurant' | 'garden' | 'other'
  guest_count INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access control: couple + family contributors
CREATE TABLE wedding_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL, -- 'owner' | 'partner' | 'bride_family' | 'groom_family'
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, user_id)
);

-- Per-category budget allocation
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL,
  allocated_pct NUMERIC, -- percentage of total
  UNIQUE(wedding_id, category)
);

-- CORE OBJECT: Vendors with payment strategy
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_quoted NUMERIC NOT NULL,
  total_nett NUMERIC, -- after GST calculation
  funded_by TEXT DEFAULT 'couple', -- 'couple' | 'bride_family' | 'groom_family' | 'other'
  notes TEXT,
  status TEXT DEFAULT 'active', -- 'active' | 'fully_paid' | 'cancelled'
  payment_strategy JSONB NOT NULL DEFAULT '[]',
  -- payment_strategy structure:
  -- [
  --   {
  --     "index": 0,
  --     "amount": 5000,
  --     "due_date": "2026-04-15",
  --     "type": "deposit" | "installment" | "balance",
  --     "card_id": "uuid-of-credit-card",
  --     "status": "planned" | "paid" | "overdue",
  --     "paid_date": null,
  --     "actual_card_id": null,
  --     "miles_earned": null,
  --     "expense_id": null
  --   }
  -- ]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actual transactions
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id), -- nullable for unmatched expenses
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'SGD',
  merchant_name TEXT,
  category TEXT,
  card_id UUID REFERENCES credit_cards(id),
  payment_type TEXT, -- 'deposit' | 'installment' | 'balance' | 'full'
  funded_by TEXT DEFAULT 'couple',
  source TEXT NOT NULL, -- 'manual' | 'voice' | 'receipt' | 'email'
  matched_payment_index INTEGER, -- index into vendor.payment_strategy
  confidence NUMERIC,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards in the couple's wallet
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  member_id UUID REFERENCES wedding_members(id),
  card_type_id UUID REFERENCES card_types(id),
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-built SG credit card database (shared, read-only for users)
CREATE TABLE card_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- 'miles' | 'cashback'
  program TEXT, -- 'krisflyer' | 'asiamiles' | 'thankyou' | null
  reward_rules JSONB NOT NULL,
  -- reward_rules structure:
  -- [
  --   { "categories": ["*"], "rate": 1.2, "channel": "any" },
  --   { "categories": ["*"], "rate": 2.0, "channel": "online" },
  --   { "categories": ["dining", "entertainment"], "rate": 4.0, "cap": 1000 }
  -- ]
  fallback_rate NUMERIC NOT NULL,
  image_url TEXT
);

-- Ang bao tracking (projections + actuals)
CREATE TABLE ang_baos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  table_number INTEGER,
  amount NUMERIC NOT NULL,
  guest_tier TEXT, -- 'close_family' | 'extended_family' | 'friend' | 'colleague'
  is_projection BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Wedding Categories (Fixed List)
```typescript
export const WEDDING_CATEGORIES = [
  'venue_banquet',
  'bridal_attire',
  'photography',
  'videography',
  'decor_florals',
  'hair_makeup',
  'rings_jewelry',
  'wedding_car',
  'dowry_guodali',
  'invitations_stationery',
  'entertainment',
  'favors_gifts',
  'misc_buffer',
] as const;
```

### SG Budget Split Benchmarks (by venue tier)
```typescript
export const BUDGET_BENCHMARKS = {
  luxury_hotel: {
    venue_banquet: 0.50, bridal_attire: 0.08, photography: 0.06,
    videography: 0.04, decor_florals: 0.06, hair_makeup: 0.03,
    rings_jewelry: 0.06, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.02, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.04,
  },
  premium_hotel: {
    venue_banquet: 0.45, bridal_attire: 0.10, photography: 0.07,
    videography: 0.04, decor_florals: 0.06, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.02, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.04,
  },
  restaurant: {
    venue_banquet: 0.38, bridal_attire: 0.12, photography: 0.08,
    videography: 0.05, decor_florals: 0.07, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.07,
    invitations_stationery: 0.03, entertainment: 0.02, favors_gifts: 0.02, misc_buffer: 0.04,
  },
  garden: {
    venue_banquet: 0.35, bridal_attire: 0.10, photography: 0.09,
    videography: 0.05, decor_florals: 0.10, hair_makeup: 0.04,
    rings_jewelry: 0.07, wedding_car: 0.01, dowry_guodali: 0.06,
    invitations_stationery: 0.03, entertainment: 0.03, favors_gifts: 0.02, misc_buffer: 0.05,
  },
};
```

### SG Credit Card Database (Initial Set)
```typescript
export const SG_CARD_TYPES = [
  {
    name: 'DBS Altitude Visa',
    bank: 'DBS',
    reward_type: 'miles',
    program: 'krisflyer',
    reward_rules: [
      { categories: ['*'], rate: 1.2, channel: 'any' },
      { categories: ['*'], rate: 2.0, channel: 'online' },
    ],
    fallback_rate: 1.2,
  },
  {
    name: 'UOB PRVI Miles',
    bank: 'UOB',
    reward_type: 'miles',
    program: 'krisflyer',
    reward_rules: [
      { categories: ['*'], rate: 1.4, channel: 'any' },
    ],
    fallback_rate: 1.4,
  },
  {
    name: 'DBS Woman\'s World',
    bank: 'DBS',
    reward_type: 'miles',
    program: 'krisflyer',
    reward_rules: [
      { categories: ['*'], rate: 4.0, channel: 'online', cap: 2000 },
      { categories: ['*'], rate: 0.4, channel: 'any' },
    ],
    fallback_rate: 0.4,
  },
  {
    name: 'HSBC Revolution',
    bank: 'HSBC',
    reward_type: 'miles',
    program: 'krisflyer',
    reward_rules: [
      { categories: ['dining', 'entertainment', 'online'], rate: 4.0, cap: 1000 },
      { categories: ['*'], rate: 0.4 },
    ],
    fallback_rate: 0.4,
  },
  {
    name: 'AMEX KrisFlyer',
    bank: 'AMEX',
    reward_type: 'miles',
    program: 'krisflyer',
    reward_rules: [
      { categories: ['*'], rate: 1.1, channel: 'any' },
      { categories: ['*'], rate: 2.0, channel: 'overseas' },
    ],
    fallback_rate: 1.1,
  },
  {
    name: 'Citi PremierMiles',
    bank: 'Citi',
    reward_type: 'miles',
    program: 'krisflyer',
    reward_rules: [
      { categories: ['*'], rate: 1.2, channel: 'any' },
      { categories: ['*'], rate: 2.0, channel: 'overseas' },
    ],
    fallback_rate: 1.2,
  },
  {
    name: 'OCBC 365',
    bank: 'OCBC',
    reward_type: 'cashback',
    program: null,
    reward_rules: [
      { categories: ['dining'], rate: 6.0, cap: 800 },
      { categories: ['groceries'], rate: 3.0, cap: 800 },
      { categories: ['*'], rate: 0.3 },
    ],
    fallback_rate: 0.3,
  },
  {
    name: 'UOB One',
    bank: 'UOB',
    reward_type: 'cashback',
    program: null,
    reward_rules: [
      { categories: ['*'], rate: 3.33, min_spend: 500 },
      { categories: ['*'], rate: 0.3 },
    ],
    fallback_rate: 0.3,
  },
];
```

---

### Phase 1 Build Scope (The Planner)

Build the planning surface first. No transaction tracking yet — just the budget plan.

#### Pages to build:

1. **`/` — Landing / marketing page** (can be minimal for now, just a CTA to sign up)

2. **`/onboarding` — Progressive setup flow (7 steps)**
   - Step 1: Welcome
   - Step 2: Total budget (input + "help me estimate" option)
   - Step 3: Wedding basics (date, guest count, venue tier)
   - Step 4: Budget category split (AI-suggested, adjustable sliders)
   - Step 5: Add credit cards (both partners, from SG card database)
   - Step 6: Invite partner (magic link via email/WhatsApp)
   - Step 7: Summary — "Your wedding at a glance" with budget breakdown + optimal card per category

3. **`/dashboard` — Web dashboard (main planning surface)**
   - Top metrics: total budget, spent, remaining, net cost estimate
   - Budget breakdown bar (color-coded by category)
   - Vendor list table: name, category, quoted, paid, balance, next payment, card, status
   - Upcoming payments sidebar: next 5 payments with card recommendations
   - Miles summary card: total earned, honeymoon equivalency
   - Persistent quick-add input bar at bottom

4. **`/vendors/[id]` — Vendor detail page**
   - Full vendor info: name, category, total quoted, nett (GST calculated)
   - Payment strategy: list of planned payments with card assignment
   - Multi-card split builder for large vendors
   - Payment history: which payments have been made, which card, miles earned
   - Card recommendation for next payment
   - Edit/delete vendor

5. **`/cards` — Card wallet management**
   - Both partners' cards listed
   - Add/remove cards from SG database
   - Per-card stats: total wedding spend on this card, miles/cashback earned
   - Optimal card assignment overview by category

6. **`/settings` — Wedding settings**
   - Edit wedding date, guest count, venue tier
   - Manage budget category allocations
   - Partner management
   - Email forwarding setup (for Phase 2)
   - Export data

#### API Routes:

- `POST /api/parse-vendor` — Claude Haiku parses natural language vendor input
- `POST /api/optimize-cards` — Deterministic card optimizer (no AI)
- `GET/POST /api/vendors` — CRUD for vendors
- `GET/POST /api/expenses` — CRUD for expenses (Phase 2)
- `POST /api/calculate-gst` — Convert ++ to nett pricing

#### Key Components:

- `BudgetSplitEditor` — Interactive category allocation with sliders + stacked bar
- `VendorCard` — Compact vendor summary with payment status
- `PaymentStrategyBuilder` — Multi-card split assignment for a vendor
- `CardPicker` — Select cards from SG database with reward info
- `QuickAddBar` — Persistent NLP input for adding vendors/expenses
- `MilesSummary` — Miles earned + honeymoon equivalency calculator
- `GSTCalculator` — Convert ++ pricing to nett

---

### AI Parsing Prompt (for /api/parse-vendor)

```
You are a vendor extraction engine for a Singapore wedding budget app.
Extract structured data from informal user inputs about wedding vendors.
Return valid JSON only. No explanations, no markdown.

OUTPUT FORMAT:
{
  "vendor_name": string | null,
  "category": string | null,
  "total_quoted": number | null,
  "is_plus_plus": boolean,
  "deposit_amount": number | null,
  "deposit_paid": boolean,
  "card_used": string | null,
  "payment_notes": string | null,
  "confidence": number
}

RULES:
1. Amount: Convert shorthand (5k→5000, 2.8k→2800). If "per table", multiply by table count if given.
2. GST: If input mentions "++" or "plus plus", set is_plus_plus=true.
3. Category: Map to one of: venue_banquet, bridal_attire, photography, videography, decor_florals, hair_makeup, rings_jewelry, wedding_car, dowry_guodali, invitations_stationery, entertainment, favors_gifts, misc_buffer. If unclear→null.
4. Card: Extract whatever the user said, keep raw text lowercase. If not mentioned→null.
5. Deposit: Look for "deposit", "downpayment", "paid today". If mentioned, extract amount and set deposit_paid accordingly.
6. Confidence: 0.9+ clear input | 0.6-0.8 partial | <0.5 too vague.

DO NOT: invent amounts, guess vendors, output anything outside JSON.

EXAMPLES:
Input: "booked fullerton bay 20 tables $1800++ per table, 5k deposit on uob"
Output: {"vendor_name":"Fullerton Bay Hotel","category":"venue_banquet","total_quoted":36000,"is_plus_plus":true,"deposit_amount":5000,"deposit_paid":true,"card_used":"uob","payment_notes":"20 tables","confidence":0.95}

Input: "got quote from florist $3200 for centerpieces and arch"
Output: {"vendor_name":null,"category":"decor_florals","total_quoted":3200,"is_plus_plus":false,"deposit_amount":null,"deposit_paid":false,"card_used":null,"payment_notes":"centerpieces and arch","confidence":0.75}

Input: "MUA confirmed $800, paid deposit $400 today"
Output: {"vendor_name":null,"category":"hair_makeup","total_quoted":800,"is_plus_plus":false,"deposit_amount":400,"deposit_paid":true,"card_used":null,"payment_notes":null,"confidence":0.8}
```

---

### Design Direction

- **Warm, premium, wedding-appropriate.** Not a finance app aesthetic — more like a high-end wedding planner tool.
- Reference Braindrops' warm whites and orange accents but adapted for a wedding context: warm whites, soft coral/blush accents, sage green for success states.
- Clean typography, generous whitespace, card-based layout.
- Mobile: input-first, minimal taps, confirmation cards.
- Desktop: information-dense dashboard, data tables, side-by-side comparisons.

---

### Build Order for Phase 1

1. Supabase project setup (schema, RLS policies, seed card_types data)
2. Next.js project with Tailwind, basic layout
3. Auth flow (magic link signup/login)
4. Onboarding flow (7 steps, progressive)
5. Dashboard (budget overview + vendor list + miles summary)
6. Add vendor flow (NLP input + vendor card confirmation)
7. Vendor detail page (payment strategy + card assignment)
8. Card wallet management
9. GST calculator utility
10. Card optimizer engine (deterministic)
11. PWA manifest + service worker
