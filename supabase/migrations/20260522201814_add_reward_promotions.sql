/*
  # Add reward promotions table

  ## Overview
  Tracks paid promotion windows for business rewards. When a business pays to
  promote a reward, a row is created here recording the Stripe session, the
  number of days purchased, and the start/end window.

  ## New Tables
  - `reward_promotions`
    - `id` — primary key
    - `reward_id` — FK to rewards
    - `business_id` — FK to businesses (denormalized for easy querying)
    - `stripe_session_id` — Stripe checkout session ID
    - `stripe_payment_intent_id` — populated after payment completes (via webhook or polling)
    - `days_purchased` — how many days of promotion were paid for
    - `amount_cents` — total charged in cents
    - `status` — pending | active | expired | cancelled
    - `starts_at` — when promotion window begins (set on payment success)
    - `ends_at` — starts_at + days_purchased
    - `created_at`

  ## Schema changes
  - Adds `is_sponsored` boolean to `rewards` table (separate from `is_promoted`/Featured)
    - `is_promoted` = Featured (free, curated by business)
    - `is_sponsored` = Promoted (paid placement at top of marketplace)

  ## Security
  - RLS enabled on reward_promotions
  - Business owners can read/insert their own reward promotions
  - Authenticated users can read active promotions (to show sponsored badge)
*/

-- Add is_sponsored to rewards
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false;

-- Create reward_promotions table
CREATE TABLE IF NOT EXISTS reward_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL DEFAULT '',
  stripe_payment_intent_id text NOT NULL DEFAULT '',
  days_purchased integer NOT NULL DEFAULT 1,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reward_promotions ENABLE ROW LEVEL SECURITY;

-- Business owners can read their own promotions
CREATE POLICY "Business owners can read own reward promotions"
  ON reward_promotions FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE profile_id = auth.uid()
    )
  );

-- Business owners can insert promotions for their own rewards
CREATE POLICY "Business owners can insert reward promotions"
  ON reward_promotions FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE profile_id = auth.uid()
    )
  );

-- Business owners can update their own promotions (e.g. status changes)
CREATE POLICY "Business owners can update own reward promotions"
  ON reward_promotions FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE profile_id = auth.uid()
    )
  );

-- Index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_reward_promotions_reward_id ON reward_promotions(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_promotions_business_id ON reward_promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_reward_promotions_status ON reward_promotions(status);
