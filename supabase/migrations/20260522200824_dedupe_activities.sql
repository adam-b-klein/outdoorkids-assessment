/*
  # Deduplicate activities

  ## Overview
  The activities table contains duplicate entries for the same real-world
  locations that were seeded in separate migrations. Each duplicate pair has
  the same name and city but different activity_type arrays and points_per_hour
  values. This migration deletes the lower-quality duplicate (lower pts/hr,
  less descriptive) from each pair, leaving one authoritative row per place.

  ## Rows deleted (lower pts/hr duplicate in each pair)
  Portland:
    - Multnomah County Central Library  (40 pts/hr, learning only)
    - Portland Children's Museum        (60 pts/hr, learning,cultural)
    - Portland Farmers Market at PSU    (40 pts/hr, community,cultural)
    - Powell's City of Books            (40 pts/hr, learning,cultural)
    - Tryon Creek State Natural Area    (50 pts/hr, outdoor,physical)
    - Washington Park                   (50 pts/hr, outdoor,physical)
    - Oregon Zoo                        (60 pts/hr, learning,cultural)

  San Francisco:
    - California Academy of Sciences    (60 pts/hr, learning,cultural)
    - Crissy Field                      (40 pts/hr, outdoor,physical)
    - Dolores Park                      (40 pts/hr, outdoor,physical)
    - Exploratorium                     (60 pts/hr, learning,cultural)
    - Ferry Building Farmers Market     (40 pts/hr, community,cultural)
    - Golden Gate Park                  (50 pts/hr, outdoor,physical)
    - Muir Woods National Monument      (50 pts/hr, outdoor,physical)
    - SF Public Library - Main Branch   (40 pts/hr, learning)
    - Tilden Regional Park              (50 pts/hr, outdoor,physical,learning)

  ## Notes
  - Only the specific UUIDs of the lower-quality row are deleted
  - No other data is affected
*/

DELETE FROM activities WHERE id IN (
  -- Portland duplicates (keeping higher pts/hr row)
  'cf70867a-f76a-47db-997b-3a0129453c4c', -- Multnomah County Central Library 40pts learning
  'e78b9306-3769-4de3-8db2-bfcbed895297', -- Portland Children's Museum 60pts learning,cultural
  'e0f4a5bf-d1b7-4c2a-9b57-e9dfd751b3c9', -- Portland Farmers Market at PSU 40pts community,cultural
  'afa8f089-85c4-4317-af75-430ae286cf9e', -- Powell's City of Books 40pts learning,cultural
  '8f3397d2-3094-4ff3-b660-82ce208e53e5', -- Tryon Creek State Natural Area 50pts outdoor,physical
  '938a17f9-689b-4d58-87d1-4e3333519de5', -- Washington Park 50pts outdoor,physical
  '4f304446-4e31-4280-968c-41e629c2261c', -- Oregon Zoo 60pts learning,cultural

  -- SF duplicates (keeping higher pts/hr row)
  'c75065a7-a8fd-4608-ac80-9e5c7f34d95e', -- California Academy of Sciences 60pts learning,cultural
  '42266508-79d5-4958-9f8a-35897afcf801', -- Crissy Field 40pts outdoor,physical
  '924b9096-cea5-4b1f-952a-e78e9829a00c', -- Dolores Park 40pts outdoor,physical
  '544985e6-f843-4403-8f8d-d502a1b2a573', -- Exploratorium 60pts learning,cultural
  'ae0b804b-6062-4684-92af-2818d7b66902', -- Ferry Building Farmers Market 40pts community,cultural
  '6fc4e074-33f6-4d75-90fb-93d1c6098cd9', -- Golden Gate Park 50pts outdoor,physical
  '9b0a6a60-5e87-45dd-ac8f-d4e7b18a2bc4', -- Muir Woods National Monument 50pts outdoor,physical
  '11929e67-35df-413a-a8eb-0503928bd0fd', -- SF Public Library - Main Branch 40pts learning
  '77fa9fc6-2910-42f2-a0a1-096fee3ad67a'  -- Tilden Regional Park 50pts outdoor,physical,learning
);
