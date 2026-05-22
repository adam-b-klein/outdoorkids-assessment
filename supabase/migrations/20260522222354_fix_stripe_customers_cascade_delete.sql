/*
  # Fix stripe_customers cascade delete

  The stripe_customers table has a FK to auth.users with NO ACTION on delete,
  which blocks account deletion. This changes it to CASCADE so deleting a user
  automatically removes their stripe_customers row.
*/

ALTER TABLE stripe_customers
  DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;

ALTER TABLE stripe_customers
  ADD CONSTRAINT stripe_customers_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
