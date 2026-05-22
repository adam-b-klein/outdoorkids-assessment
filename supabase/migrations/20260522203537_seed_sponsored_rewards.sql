/*
  # Seed sponsored reward mock data

  ## Overview
  Marks one reward per market as is_sponsored = true and inserts a matching
  active reward_promotions row so that household users see the Sponsored section
  populated in the marketplace. This demonstrates the full Sponsored → Featured
  → All rewards hierarchy.

  ## Changes
  - Portland:  "Free Open Gym Session (1 Child)" → is_sponsored = true
  - SF:        "Free Child Exploratorium Ticket"  → is_sponsored = true
  - Inserts two active reward_promotions rows (30 days, ends ~1 month from now)
*/

-- Mark one Portland reward as sponsored
UPDATE rewards
SET is_sponsored = true
WHERE id = 'aa100000-0000-0000-0000-000000000013';

-- Mark one SF reward as sponsored
UPDATE rewards
SET is_sponsored = true
WHERE id = 'bb200000-0000-0000-0000-000000000001';

-- Insert active promotion records (using gen_random_uuid() for valid UUIDs)
INSERT INTO reward_promotions
  (reward_id, business_id, stripe_session_id, stripe_payment_intent_id,
   days_purchased, amount_cents, status, starts_at, ends_at)
VALUES
  (
    'aa100000-0000-0000-0000-000000000013',
    'b1100000-0000-0000-0000-000000000005',
    'cs_mock_portland',
    'pi_mock_portland',
    30,
    30000,
    'active',
    now(),
    now() + interval '30 days'
  ),
  (
    'bb200000-0000-0000-0000-000000000001',
    'b2200000-0000-0000-0000-000000000001',
    'cs_mock_sf',
    'pi_mock_sf',
    30,
    30000,
    'active',
    now(),
    now() + interval '30 days'
  );
