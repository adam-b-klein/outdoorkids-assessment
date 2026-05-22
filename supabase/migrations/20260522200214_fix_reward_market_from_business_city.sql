/*
  # Fix reward market values based on business city

  ## Overview
  The previous seed migration left SF-based business rewards with market = 'portland'
  because the market column defaulted to 'portland'. This migration corrects that by
  setting each reward's market to match its business's actual city.

  ## Changes
  - UPDATE rewards: set market = 'san_francisco' where the linked business is in SF or Sausalito
  - UPDATE rewards: set market = 'portland' where the linked business is in Portland
  - This ensures Portland users only see Portland rewards and SF users only see SF rewards
*/

UPDATE rewards
SET market = 'san_francisco'
WHERE business_id IN (
  SELECT id FROM businesses
  WHERE city IN ('San Francisco', 'Sausalito', 'Oakland', 'Berkeley')
);

UPDATE rewards
SET market = 'portland'
WHERE business_id IN (
  SELECT id FROM businesses
  WHERE city IN ('Portland', 'Beaverton', 'Lake Oswego', 'Tigard')
);
