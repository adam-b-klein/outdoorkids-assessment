/*
  # Seed Businesses and Rewards for Portland and SF

  ## Overview
  Populates the businesses and rewards tables with realistic mock data for the
  OutdoorKids app to demonstrate a fully functioning rewards marketplace.

  ## Changes

  ### Schema
  - Adds `market` column to `rewards` table for direct market-based filtering
  - Makes `businesses.profile_id` nullable so seed businesses don't require real auth users

  ### Businesses (20 total)
  - 10 Portland kid-friendly businesses across restaurant, retail, education,
    entertainment, sports, arts, and outdoor categories
  - 10 San Francisco kid-friendly businesses across the same categories

  ### Rewards (40 total)
  - 2 rewards per business; types span gift_card, coupon, event_pass, discount
  - Mix of promoted (featured) and standard rewards
  - Point costs range 150–1500 to simulate a realistic, active marketplace
  - All tagged with a market value for location-based filtering

  ## Security
  - RLS already enabled on both tables; existing policies unchanged
*/

-- Add market column to rewards
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS market text
  DEFAULT 'portland'
  CHECK (market IN ('portland', 'san_francisco', 'other'));

-- Make businesses.profile_id nullable to support seed data not tied to real auth users
ALTER TABLE businesses ALTER COLUMN profile_id DROP NOT NULL;

-- ─── PORTLAND BUSINESSES ────────────────────────────────────────────────────

INSERT INTO businesses (id, profile_id, business_name, category, description, city, state, zip, is_verified, is_active)
VALUES
  ('b1100000-0000-0000-0000-000000000001', NULL, 'Powell''s Books for Kids', 'retail',
   'World-famous independent bookstore with an entire floor dedicated to children''s books and author events.',
   'Portland', 'OR', '97209', true, true),
  ('b1100000-0000-0000-0000-000000000002', NULL, 'Oregon Museum of Science and Industry', 'education',
   'Hands-on science museum with exhibits, planetarium, and IMAX theater perfect for curious kids.',
   'Portland', 'OR', '97214', true, true),
  ('b1100000-0000-0000-0000-000000000003', NULL, 'Ground Kontrol Classic Arcade', 'entertainment',
   'Retro arcade with classic games and pinball — family hours every afternoon.',
   'Portland', 'OR', '97209', true, true),
  ('b1100000-0000-0000-0000-000000000004', NULL, 'Hopworks Urban Brewery Family Pub', 'restaurant',
   'Family-friendly organic brewery with a kids menu, outdoor patio, and bikes on display.',
   'Portland', 'OR', '97202', true, true),
  ('b1100000-0000-0000-0000-000000000005', NULL, 'Portland Children''s Museum', 'arts',
   'Creative play museum with art studios, water play, a tot spot for toddlers, and rotating exhibits.',
   'Portland', 'OR', '97221', true, true),
  ('b1100000-0000-0000-0000-000000000006', NULL, 'Kerr Bikes', 'sports',
   'Family bike shop specializing in kids bikes, trailers, and cargo bikes with a free fitting service.',
   'Portland', 'OR', '97202', true, true),
  ('b1100000-0000-0000-0000-000000000007', NULL, 'Treetop Adventure PDX', 'outdoor',
   'Zip lines, rope bridges, and aerial adventures through the forest canopy for ages 4 and up.',
   'Portland', 'OR', '97229', true, true),
  ('b1100000-0000-0000-0000-000000000008', NULL, 'Blue Star Donuts', 'restaurant',
   'Beloved Portland donut shop with rotating seasonal flavors and a dedicated kids dozen box.',
   'Portland', 'OR', '97209', true, true),
  ('b1100000-0000-0000-0000-000000000009', NULL, 'Saturday Academy', 'education',
   'STEM and arts enrichment programs for kids K–12: robotics, creative writing, cooking, and more.',
   'Portland', 'OR', '97201', true, true),
  ('b1100000-0000-0000-0000-000000000010', NULL, 'North Portland Aquatic Center', 'sports',
   'Community pool with open swim, swim lessons, water slides, and family discount memberships.',
   'Portland', 'OR', '97203', true, true)
ON CONFLICT (id) DO NOTHING;

-- ─── SF BUSINESSES ───────────────────────────────────────────────────────────

INSERT INTO businesses (id, profile_id, business_name, category, description, city, state, zip, is_verified, is_active)
VALUES
  ('b2200000-0000-0000-0000-000000000001', NULL, 'The Randall Museum', 'education',
   'Free hilltop museum with live animals, a working train layout, art studios, and science labs.',
   'San Francisco', 'CA', '94114', true, true),
  ('b2200000-0000-0000-0000-000000000002', NULL, 'Exploratorium', 'education',
   'World-renowned hands-on science and art museum on Pier 15 with 650+ interactive exhibits.',
   'San Francisco', 'CA', '94111', true, true),
  ('b2200000-0000-0000-0000-000000000003', NULL, 'Roam Artisan Burgers', 'restaurant',
   'Family-friendly burger joint with grass-fed beef, a dedicated kids menu, and thick milkshakes.',
   'San Francisco', 'CA', '94123', true, true),
  ('b2200000-0000-0000-0000-000000000004', NULL, 'SF Rock Gym', 'sports',
   'Youth climbing programs, birthday parties, and open family climbing at two SF locations.',
   'San Francisco', 'CA', '94107', true, true),
  ('b2200000-0000-0000-0000-000000000005', NULL, 'Bookshop West Portal', 'retail',
   'Neighborhood indie bookstore with a fantastic children''s section, story times, and author readings.',
   'San Francisco', 'CA', '94127', true, true),
  ('b2200000-0000-0000-0000-000000000006', NULL, 'Children''s Creativity Museum', 'arts',
   'Digital art, animation studio, music production, and maker space for kids 2–12.',
   'San Francisco', 'CA', '94103', true, true),
  ('b2200000-0000-0000-0000-000000000007', NULL, 'Golden Gate Park Bike & Skate', 'outdoor',
   'Bike and skate rentals right at Golden Gate Park — tandem bikes, surreys, and kids sizes.',
   'San Francisco', 'CA', '94117', true, true),
  ('b2200000-0000-0000-0000-000000000008', NULL, 'Dandelion Chocolate', 'restaurant',
   'Bean-to-bar chocolate factory with a cafe, tasting tours, and chocolate-making classes for kids.',
   'San Francisco', 'CA', '94110', true, true),
  ('b2200000-0000-0000-0000-000000000009', NULL, 'YMCA San Francisco', 'sports',
   'Family memberships, swim lessons, youth sports leagues, and after-school programs across SF.',
   'San Francisco', 'CA', '94102', true, true),
  ('b2200000-0000-0000-0000-000000000010', NULL, 'Zeum Children''s Creativity', 'entertainment',
   'Interactive gallery experiences, animation workshops, and creative tech labs for families.',
   'San Francisco', 'CA', '94103', true, true)
ON CONFLICT (id) DO NOTHING;

-- ─── PORTLAND REWARDS ────────────────────────────────────────────────────────

INSERT INTO rewards (id, business_id, market, title, description, reward_type, point_cost, quantity_available, quantity_redeemed, is_promoted, is_active, terms)
VALUES
  ('a1100000-0000-0000-0000-000000000001', 'b1100000-0000-0000-0000-000000000001', 'portland',
   '$10 Powell''s Gift Card', 'Spend it on any children''s book in-store or online.', 'gift_card', 500, 200, 47, true, true,
   'Valid in-store and online. No expiry. One per household per month.'),
  ('a1100000-0000-0000-0000-000000000002', 'b1100000-0000-0000-0000-000000000001', 'portland',
   '20% Off Any Kids Book', 'One-time 20% discount on any single children''s book purchase.', 'discount', 200, 300, 88, false, true,
   'Single use. Cannot combine with other offers.'),
  ('a1100000-0000-0000-0000-000000000003', 'b1100000-0000-0000-0000-000000000001', 'portland',
   'Free Story Time Admission', 'Priority seating at any Saturday morning children''s story time.', 'event_pass', 150, 500, 112, false, true,
   'Show code at the info desk. Valid for up to 4 children.'),

  ('a1100000-0000-0000-0000-000000000004', 'b1100000-0000-0000-0000-000000000002', 'portland',
   'Free Child Admission to OMSI', 'One free child (ages 3–17) general admission ticket.', 'coupon', 400, 150, 63, true, true,
   'Valid Sun–Fri. Excludes IMAX and special events. Expires 90 days.'),
  ('a1100000-0000-0000-0000-000000000005', 'b1100000-0000-0000-0000-000000000002', 'portland',
   'IMAX Movie Pass for Two', 'Two tickets to any OMSI IMAX showing.', 'event_pass', 600, 100, 34, false, true,
   'Excludes premiere screenings. Book online or at box office.'),
  ('a1100000-0000-0000-0000-000000000006', 'b1100000-0000-0000-0000-000000000002', 'portland',
   '$25 Off OMSI Family Membership', '$25 off a new OMSI family membership.', 'discount', 800, 75, 21, false, true,
   'New memberships only. Present code at membership desk.'),

  ('a1100000-0000-0000-0000-000000000007', 'b1100000-0000-0000-0000-000000000005', 'portland',
   'Free Family Day Pass', 'Admission for 2 adults and 3 children at Portland Children''s Museum.', 'event_pass', 700, 100, 29, true, true,
   'Valid weekdays only. Reservation recommended. Expires 60 days.'),
  ('a1100000-0000-0000-0000-000000000008', 'b1100000-0000-0000-0000-000000000005', 'portland',
   'Art Studio Workshop Spot', 'One child spot in a Saturday art studio workshop (ages 4–10).', 'event_pass', 350, 200, 55, false, true,
   'Register online with code. Subject to availability.'),

  ('a1100000-0000-0000-0000-000000000009', 'b1100000-0000-0000-0000-000000000007', 'portland',
   'Free Kid Aerial Adventure', 'One free junior course admission (ages 4–12) at Treetop Adventure PDX.', 'coupon', 600, 80, 18, true, true,
   'Valid weekends. Must be accompanied by a paying adult. Expires 90 days.'),
  ('a1100000-0000-0000-0000-000000000010', 'b1100000-0000-0000-0000-000000000007', 'portland',
   '15% Off Family Package', '15% discount on any family package booking of 3 or more.', 'discount', 300, 150, 41, false, true,
   'Book online. Cannot combine with other promotions.'),

  ('a1100000-0000-0000-0000-000000000011', 'b1100000-0000-0000-0000-000000000006', 'portland',
   'Free Kids Bike Tune-Up', 'One complimentary tune-up for any bike with a 20" wheel or smaller.', 'coupon', 300, 120, 37, false, true,
   'Drop off during business hours. Allow 3–5 business days.'),
  ('a1100000-0000-0000-0000-000000000012', 'b1100000-0000-0000-0000-000000000006', 'portland',
   '$20 Kerr Bikes Gift Card', 'Toward any accessories, gear, or service purchase in-store.', 'gift_card', 800, 60, 12, false, true,
   'In-store use only. No cash value.'),

  ('a1100000-0000-0000-0000-000000000013', 'b1100000-0000-0000-0000-000000000004', 'portland',
   'Free Kids Meal at Hopworks', 'One free kids meal (12 and under) with any adult entrée.', 'coupon', 250, 300, 94, false, true,
   'Dine-in only. One per table per visit. Valid Sun–Thu.'),
  ('a1100000-0000-0000-0000-000000000014', 'b1100000-0000-0000-0000-000000000004', 'portland',
   'Family Brunch 20% Off', '20% off brunch for a party of 4+ including at least one child.', 'discount', 400, 200, 61, false, true,
   'Weekend brunch only. Dine-in. Present code to server.'),

  ('a1100000-0000-0000-0000-000000000015', 'b1100000-0000-0000-0000-000000000008', 'portland',
   'Free Mini Donut Box', 'One free box of 6 mini donuts — perfect for little ones.', 'coupon', 200, 400, 128, false, true,
   'Any location. One per visit. While supplies last.'),
  ('a1100000-0000-0000-0000-000000000016', 'b1100000-0000-0000-0000-000000000008', 'portland',
   '$5 Off Any Donut Order', '$5 off any in-store or online order of $15 or more.', 'discount', 150, 500, 203, false, true,
   'One use per visit.'),

  ('a1100000-0000-0000-0000-000000000017', 'b1100000-0000-0000-0000-000000000009', 'portland',
   '$30 Off Any Saturday Class', '$30 discount on any one-day Saturday Academy enrichment class.', 'discount', 900, 50, 8, false, true,
   'New enrollments only. Cannot combine with financial aid.'),
  ('a1100000-0000-0000-0000-000000000018', 'b1100000-0000-0000-0000-000000000009', 'portland',
   'Free Trial Class Pass', 'One child attends any single class session at no cost before enrolling.', 'event_pass', 200, 100, 22, false, true,
   'Subject to class availability. Register online with code.'),

  ('a1100000-0000-0000-0000-000000000019', 'b1100000-0000-0000-0000-000000000003', 'portland',
   '$10 Arcade Credits', '$10 in game credits at Ground Kontrol during family hours (before 5 PM).', 'gift_card', 400, 150, 49, false, true,
   'Family hours: Mon–Fri before 5 PM, Sat–Sun before 4 PM.'),
  ('a1100000-0000-0000-0000-000000000020', 'b1100000-0000-0000-0000-000000000010', 'portland',
   'Free Family Swim Session', 'One free family open swim for up to 2 adults and 3 kids.', 'coupon', 300, 200, 67, false, true,
   'Valid during open swim hours. Show code at front desk.');

-- ─── SF REWARDS ──────────────────────────────────────────────────────────────

INSERT INTO rewards (id, business_id, market, title, description, reward_type, point_cost, quantity_available, quantity_redeemed, is_promoted, is_active, terms)
VALUES
  ('a2200000-0000-0000-0000-000000000001', 'b2200000-0000-0000-0000-000000000002', 'san_francisco',
   'Free Child Admission — Exploratorium', 'One free child (ages 4–17) general admission on Pier 15.', 'coupon', 500, 150, 72, true, true,
   'Valid Tue–Sun. Excludes After Dark evenings. Expires 90 days.'),
  ('a2200000-0000-0000-0000-000000000002', 'b2200000-0000-0000-0000-000000000002', 'san_francisco',
   '$25 Exploratorium Gift Card', 'Redeemable for admission, memberships, or the store.', 'gift_card', 900, 100, 31, false, true,
   'In-person use only. No cash value.'),
  ('a2200000-0000-0000-0000-000000000003', 'b2200000-0000-0000-0000-000000000002', 'san_francisco',
   '$30 Off Exploratorium Membership', '$30 off a new Exploratorium family membership.', 'discount', 1200, 50, 9, false, true,
   'New memberships only. One per family per year.'),

  ('a2200000-0000-0000-0000-000000000004', 'b2200000-0000-0000-0000-000000000001', 'san_francisco',
   'Free Randall Museum Weekend Pass', 'Free admission for one family (2 adults + 2 children) on a weekend.', 'event_pass', 300, 200, 88, true, true,
   'Weekends only. Reservation recommended.'),
  ('a2200000-0000-0000-0000-000000000005', 'b2200000-0000-0000-0000-000000000001', 'san_francisco',
   'Kids Science Workshop', 'One spot in a monthly hands-on science or art workshop for ages 5–12.', 'event_pass', 400, 120, 44, false, true,
   'Register at museum front desk with code. Subject to availability.'),

  ('a2200000-0000-0000-0000-000000000006', 'b2200000-0000-0000-0000-000000000006', 'san_francisco',
   'Free Creativity Museum Admission', 'One free child admission to the Children''s Creativity Museum.', 'coupon', 350, 180, 61, true, true,
   'Valid Tue–Sun. One child per code.'),
  ('a2200000-0000-0000-0000-000000000007', 'b2200000-0000-0000-0000-000000000006', 'san_francisco',
   'Animation Studio Workshop', 'Your child creates a stop-motion animation in the studio (~60 min, ages 6+).', 'event_pass', 600, 80, 19, false, true,
   'Must book online in advance with code.'),

  ('a2200000-0000-0000-0000-000000000008', 'b2200000-0000-0000-0000-000000000004', 'san_francisco',
   'Free Kids Intro Climb Session', 'One free introductory youth climbing session (ages 5–15) — harness included.', 'coupon', 400, 100, 27, false, true,
   'Must be accompanied by a parent. Weekdays only.'),
  ('a2200000-0000-0000-0000-000000000009', 'b2200000-0000-0000-0000-000000000004', 'san_francisco',
   '20% Off Youth Climbing Camp', '20% off any one-week youth climbing camp enrollment.', 'discount', 1500, 30, 5, false, true,
   'Summer and school-break camps only. New campers only.'),

  ('a2200000-0000-0000-0000-000000000010', 'b2200000-0000-0000-0000-000000000005', 'san_francisco',
   '$10 Bookshop West Portal Gift Card', '$10 toward any children''s book in-store.', 'gift_card', 450, 200, 66, false, true,
   'In-store use only. No expiry.'),
  ('a2200000-0000-0000-0000-000000000011', 'b2200000-0000-0000-0000-000000000005', 'san_francisco',
   'Free Story Time + Book Bag', 'Reserved story time seating plus a free surprise book bag for one child.', 'coupon', 250, 300, 102, false, true,
   'Saturday mornings. While supplies last. Ages 2–7.'),

  ('a2200000-0000-0000-0000-000000000012', 'b2200000-0000-0000-0000-000000000007', 'san_francisco',
   'Free 2-Hour Kids Bike Rental', 'One free 2-hour kids bike rental at Golden Gate Park Bike & Skate.', 'coupon', 350, 150, 58, true, true,
   'Helmet included. Weekdays only. Subject to availability.'),
  ('a2200000-0000-0000-0000-000000000013', 'b2200000-0000-0000-0000-000000000007', 'san_francisco',
   '25% Off Surrey Family Rental', '25% off a 1-hour surrey bike rental for the whole family.', 'discount', 300, 200, 79, false, true,
   'Weekends. Present code at rental desk.'),

  ('a2200000-0000-0000-0000-000000000014', 'b2200000-0000-0000-0000-000000000003', 'san_francisco',
   'Free Kids Meal at Roam', 'One free kids meal (12 and under) with any adult burger purchase.', 'coupon', 250, 400, 133, false, true,
   'Dine-in only. One per table per visit.'),
  ('a2200000-0000-0000-0000-000000000015', 'b2200000-0000-0000-0000-000000000003', 'san_francisco',
   '$5 Off Family Order $25+', '$5 off any family order of $25 or more.', 'discount', 200, 500, 167, false, true,
   'Dine-in and takeout. One use per visit.'),

  ('a2200000-0000-0000-0000-000000000016', 'b2200000-0000-0000-0000-000000000008', 'san_francisco',
   'Kids Chocolate-Making Class', 'One spot in a 45-minute kids chocolate-making workshop at Dandelion.', 'event_pass', 800, 60, 14, true, true,
   'Ages 5–12. Weekend sessions only. Book online with code.'),
  ('a2200000-0000-0000-0000-000000000017', 'b2200000-0000-0000-0000-000000000008', 'san_francisco',
   'Free Chocolate Tasting Flight', 'A free mini tasting flight (3 chocolate origins) for one child with adult purchase.', 'coupon', 200, 300, 87, false, true,
   'In-store only.'),

  ('a2200000-0000-0000-0000-000000000018', 'b2200000-0000-0000-0000-000000000009', 'san_francisco',
   '$40 Off YMCA Family Membership', '$40 off the first month of a new YMCA SF family membership.', 'discount', 1500, 40, 7, false, true,
   'New memberships only. Must join at an SF branch.'),
  ('a2200000-0000-0000-0000-000000000019', 'b2200000-0000-0000-0000-000000000009', 'san_francisco',
   'Free Kids Swim Lesson Trial', 'One free trial group swim lesson for a child ages 3–12.', 'coupon', 300, 200, 55, false, true,
   'Subject to class availability. Register with code at front desk.'),
  ('a2200000-0000-0000-0000-000000000020', 'b2200000-0000-0000-0000-000000000010', 'san_francisco',
   'Family Gallery Pass', 'Admission for up to 4 family members at Children''s Creativity Museum.', 'event_pass', 500, 120, 38, false, true,
   'Valid Tue–Sun. Excludes special programming days.');
