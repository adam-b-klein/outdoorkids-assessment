/*
  # Fix children age_range check constraint

  The existing constraint used numeric ranges ('0-2', '3-4', etc.)
  but the application inserts label-style values ('infant', 'toddler', etc.).
  This migration drops the old constraint and adds one that matches the app.
*/

ALTER TABLE children DROP CONSTRAINT IF EXISTS children_age_range_check;

ALTER TABLE children
  ADD CONSTRAINT children_age_range_check
  CHECK (age_range IN ('infant', 'toddler', 'preschool', 'school-age', 'tween'));
