-- Seed: SG Credit Card Types
-- Run after migration 001

INSERT INTO card_types (name, bank, reward_type, program, reward_rules, fallback_rate) VALUES
(
  'DBS Altitude Visa', 'DBS', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.2,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"online"}]',
  1.2
),
(
  'UOB PRVI Miles', 'UOB', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.4,"channel":"any"}]',
  1.4
),
(
  'DBS Woman''s World', 'DBS', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":4.0,"channel":"online","cap":2000},{"categories":["*"],"rate":0.4,"channel":"any"}]',
  0.4
),
(
  'HSBC Revolution', 'HSBC', 'miles', 'krisflyer',
  '[{"categories":["dining","entertainment","online"],"rate":4.0,"cap":1000},{"categories":["*"],"rate":0.4}]',
  0.4
),
(
  'AMEX KrisFlyer', 'AMEX', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.1,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"overseas"}]',
  1.1
),
(
  'Citi PremierMiles', 'Citi', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.2,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"overseas"}]',
  1.2
),
(
  'OCBC 365', 'OCBC', 'cashback', NULL,
  '[{"categories":["dining"],"rate":6.0,"cap":800},{"categories":["groceries"],"rate":3.0,"cap":800},{"categories":["*"],"rate":0.3}]',
  0.3
),
(
  'UOB One', 'UOB', 'cashback', NULL,
  '[{"categories":["*"],"rate":3.33,"min_spend":500},{"categories":["*"],"rate":0.3}]',
  0.3
),
(
  'AMEX Platinum Charge', 'AMEX', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.25,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"overseas"}]',
  1.25
),
(
  'UOB KrisFlyer', 'UOB', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.2,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"overseas"}]',
  1.2
);
