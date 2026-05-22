/*
  # Deduplicate near-duplicate activity name variants

  ## Overview
  Two activity pairs share the same real-world location but have slightly
  different names. This migration deletes the lower-quality entry from each
  pair and normalizes the surviving row's name.

  ## Changes
  - Delete "Oaks Park Amusement" (70pts, truncated name) — keep "Oaks Park Amusement Park" but raise its pts to 70
  - Delete "Oregon Museum of Science and Industry" (60pts, missing OMSI) — keep "(OMSI)" variant at 80pts but normalize name
*/

-- Raise surviving Oaks Park row to the better pts value and normalize name
UPDATE activities
SET points_per_hour = 70, name = 'Oaks Park Amusement Park'
WHERE id = 'e1c8864d-a1bd-422a-b12a-3ad1874257a2';

DELETE FROM activities WHERE id = 'dfaec836-842e-4695-add9-7912287329cb';

-- Normalize OMSI name, keep 80pts row
UPDATE activities
SET name = 'Oregon Museum of Science and Industry (OMSI)'
WHERE id = 'ec67c5b9-fb13-4a68-b28f-20773ea4e92f';

DELETE FROM activities WHERE id = '4fcf99d2-5fc2-4a05-84b0-61cffdfd4cd6';
