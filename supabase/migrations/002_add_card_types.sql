-- Migration: add AMEX Platinum Charge and UOB KrisFlyer card types
-- Safe to re-run: uses INSERT ... WHERE NOT EXISTS

INSERT INTO card_types (name, bank, reward_type, program, reward_rules, fallback_rate)
SELECT 'AMEX Platinum Charge', 'AMEX', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.25,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"overseas"}]'::jsonb,
  1.25
WHERE NOT EXISTS (SELECT 1 FROM card_types WHERE name = 'AMEX Platinum Charge');

INSERT INTO card_types (name, bank, reward_type, program, reward_rules, fallback_rate)
SELECT 'UOB KrisFlyer', 'UOB', 'miles', 'krisflyer',
  '[{"categories":["*"],"rate":1.2,"channel":"any"},{"categories":["*"],"rate":2.0,"channel":"overseas"}]'::jsonb,
  1.2
WHERE NOT EXISTS (SELECT 1 FROM card_types WHERE name = 'UOB KrisFlyer');
