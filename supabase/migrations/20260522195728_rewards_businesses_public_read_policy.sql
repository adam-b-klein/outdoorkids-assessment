/*
  # Add read policies for rewards, businesses, and redemptions

  ## Overview
  Allows authenticated users to browse the rewards marketplace and manage
  their own redemptions.

  ## Changes
  - SELECT policy on `rewards`: authenticated users can read active rewards
  - SELECT policy on `businesses`: authenticated users can read active businesses
  - SELECT + INSERT policies on `redemptions`: users access their own household's records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'Authenticated users can read active rewards'
  ) THEN
    CREATE POLICY "Authenticated users can read active rewards"
      ON rewards FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'businesses' AND policyname = 'Authenticated users can read active businesses'
  ) THEN
    CREATE POLICY "Authenticated users can read active businesses"
      ON businesses FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'redemptions' AND policyname = 'Households can read own redemptions'
  ) THEN
    CREATE POLICY "Households can read own redemptions"
      ON redemptions FOR SELECT
      TO authenticated
      USING (
        household_id IN (
          SELECT id FROM households WHERE profile_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'redemptions' AND policyname = 'Households can insert own redemptions'
  ) THEN
    CREATE POLICY "Households can insert own redemptions"
      ON redemptions FOR INSERT
      TO authenticated
      WITH CHECK (
        household_id IN (
          SELECT id FROM households WHERE profile_id = auth.uid()
        )
      );
  END IF;
END $$;
