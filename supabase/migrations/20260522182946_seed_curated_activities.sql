/*
  # Seed Curated Activities for Portland, OR and San Francisco, CA

  Populates activities table with well-known kid-friendly locations.
  activity_type is an array. market values: 'portland' or 'san_francisco'.
*/

INSERT INTO activities (name, description, activity_type, address, city, state, zip, lat, lng, is_free, market, is_curated, is_active, points_per_hour, age_ranges, image_url)
VALUES

-- Portland
('Washington Park', 'Expansive park featuring miles of walking trails, open meadows, and access to the rose garden. A family favorite with something for every age.', ARRAY['outdoor','physical'], '4033 SW Canyon Rd', 'Portland', 'OR', '97221', 45.5152, -122.7156, true, 'portland', true, true, 50, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1452701/pexels-photo-1452701.jpeg'),

('Oregon Zoo', 'One of the most visited attractions in Oregon, home to 1,800 animals. Educational programs, seasonal events, and exhibits covering every continent.', ARRAY['learning','cultural'], '4001 SW Canyon Rd', 'Portland', 'OR', '97221', 45.5098, -122.7156, false, 'portland', true, true, 60, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg'),

('Portland Children''s Museum', 'Hands-on exhibits designed for kids 10 and under. Creative play, art-making, water play, and sensory exploration in a welcoming indoor space.', ARRAY['learning','cultural'], '4015 SW Canyon Rd', 'Portland', 'OR', '97221', 45.5098, -122.7148, false, 'portland', true, true, 60, ARRAY['infant','toddler','preschool','school-age'], 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg'),

('Powell''s City of Books', 'The world''s largest independent bookstore. A literary landmark and wonderful destination for kids to explore reading and imagination.', ARRAY['learning','cultural'], '1005 W Burnside St', 'Portland', 'OR', '97209', 45.5231, -122.6817, true, 'portland', true, true, 40, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/694740/pexels-photo-694740.jpeg'),

('Multnomah County Central Library', 'Beautiful historic library with an exceptional children''s section, story times, STEM programs, and summer reading challenges.', ARRAY['learning'], '801 SW 10th Ave', 'Portland', 'OR', '97205', 45.5199, -122.6845, true, 'portland', true, true, 40, ARRAY['infant','toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg'),

('Oregon Museum of Science and Industry', 'Interactive science museum with five exhibit halls, a planetarium, submarine tour, and hands-on STEM experiences kids love.', ARRAY['learning','cultural'], '1945 SE Water Ave', 'Portland', 'OR', '97214', 45.5083, -122.6655, false, 'portland', true, true, 60, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg'),

('Portland Saturday Market', 'America''s largest continuously operating outdoor arts and crafts market. Cultural exposure, local food, music, and artisan goods in a lively setting.', ARRAY['cultural','community'], '2 SW Naito Pkwy', 'Portland', 'OR', '97204', 45.5229, -122.6697, true, 'portland', true, true, 40, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'),

('Tryon Creek State Natural Area', 'Urban forest with 8 miles of trails inside the city. Wildlife sightings, nature education programs, and a nature center for families.', ARRAY['outdoor','physical'], '11321 SW Terwilliger Blvd', 'Portland', 'OR', '97219', 45.4687, -122.6797, true, 'portland', true, true, 50, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg'),

('Eastbank Esplanade', 'Paved riverside path perfect for biking, walking, and scootering along the Willamette. Connects multiple parks with great city views.', ARRAY['outdoor','physical'], '98 SE Naito Pkwy', 'Portland', 'OR', '97232', 45.5231, -122.6640, true, 'portland', true, true, 40, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg'),

('Oaks Park Amusement Park', 'Historic amusement park on the Willamette River with rides, roller skating, and seasonal events. A Portland institution since 1905.', ARRAY['entertainment','physical'], '7805 SE Oaks Park Way', 'Portland', 'OR', '97202', 45.4748, -122.6590, false, 'portland', true, true, 50, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg'),

('Portland Farmers Market at PSU', 'Largest farmers market in Oregon with fresh produce and local food vendors. Great for teaching kids about where food comes from.', ARRAY['community','cultural'], '1855 SW Park Ave', 'Portland', 'OR', '97201', 45.5122, -122.6854, true, 'portland', true, true, 40, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg'),

('Glendoveer Fitness Trail', 'Popular fitness trail loop surrounded by trees. Perfect for jogging, biking, and nature walks with kids in a safe, flat environment.', ARRAY['outdoor','physical'], '14015 NE Glisan St', 'Portland', 'OR', '97230', 45.5311, -122.5271, true, 'portland', true, true, 40, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg'),

-- San Francisco / Bay Area
('Golden Gate Park', 'One of the world''s great urban parks with playgrounds, botanical gardens, lakes, and the de Young Museum all in one destination.', ARRAY['outdoor','physical'], '501 Stanyan St', 'San Francisco', 'CA', '94117', 37.7694, -122.4862, true, 'san_francisco', true, true, 50, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg'),

('California Academy of Sciences', 'World-class natural history museum with an aquarium, planetarium, and rainforest dome under one living roof.', ARRAY['learning','cultural'], '55 Music Concourse Dr', 'San Francisco', 'CA', '94118', 37.7699, -122.4661, false, 'san_francisco', true, true, 60, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg'),

('SF Children''s Creativity Museum', 'Hands-on museum focused on art, technology, and storytelling. Interactive exhibits where kids make animation, music, and more.', ARRAY['learning','cultural'], '221 4th St', 'San Francisco', 'CA', '94103', 37.7784, -122.3988, false, 'san_francisco', true, true, 60, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg'),

('Exploratorium', 'Legendary science museum on the waterfront with 650+ hands-on exhibits exploring science, art, and human perception.', ARRAY['learning','cultural'], 'Pier 15, The Embarcadero', 'San Francisco', 'CA', '94111', 37.8017, -122.3971, false, 'san_francisco', true, true, 60, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg'),

('Crissy Field', 'Restored National Park shoreline with stunning Golden Gate Bridge views, beach access, and wide open space for running and kite flying.', ARRAY['outdoor','physical'], '1199 East Beach', 'San Francisco', 'CA', '94129', 37.8032, -122.4661, true, 'san_francisco', true, true, 40, ARRAY['infant','toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg'),

('Dolores Park', 'Beloved Mission District park with a fantastic playground, wide open lawn, and incredible city views. Popular community hub for families on weekends.', ARRAY['outdoor','physical'], '101 Dolores St', 'San Francisco', 'CA', '94103', 37.7596, -122.4269, true, 'san_francisco', true, true, 40, ARRAY['infant','toddler','preschool','school-age'], 'https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg'),

('SF Public Library - Main Branch', 'Stunning public library with an excellent children''s center, story times, digital media labs, and year-round family programming.', ARRAY['learning'], '100 Larkin St', 'San Francisco', 'CA', '94102', 37.7792, -122.4155, true, 'san_francisco', true, true, 40, ARRAY['infant','toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg'),

('Muir Woods National Monument', 'Ancient coastal redwood forest just north of the Golden Gate. Walking through the towering trees is a profound experience for all ages.', ARRAY['outdoor','physical'], '1 Muir Woods Rd', 'Mill Valley', 'CA', '94941', 37.8970, -122.5811, false, 'san_francisco', true, true, 50, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg'),

('Children''s Fairyland', 'Enchanting amusement park in Oakland designed for young children, inspired by nursery rhymes and fairy tales. Bay Area institution since 1950.', ARRAY['entertainment','cultural'], '699 Bellevue Ave', 'Oakland', 'CA', '94610', 37.8079, -122.2538, false, 'san_francisco', true, true, 50, ARRAY['toddler','preschool','school-age'], 'https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg'),

('Berkeley Adventure Playground', 'Unique waterfront playground where kids can build forts, swing, and explore — plus views of the bay and open space for kite flying.', ARRAY['outdoor','physical'], '160 University Ave', 'Berkeley', 'CA', '94710', 37.8644, -122.3135, true, 'san_francisco', true, true, 50, ARRAY['preschool','school-age','tween'], 'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg'),

('Ferry Building Farmers Market', 'Iconic waterfront market with artisan food and local produce. Great for food education and experiencing Bay Area culture with kids.', ARRAY['community','cultural'], '1 Ferry Building', 'San Francisco', 'CA', '94111', 37.7955, -122.3937, true, 'san_francisco', true, true, 40, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg'),

('Tilden Regional Park', 'Vast East Bay park featuring a steam train for kids, a small farm with animals, botanical garden, and miles of trails through rolling hills.', ARRAY['outdoor','physical','learning'], '2501 Grizzly Peak Blvd', 'Berkeley', 'CA', '94708', 37.8999, -122.2430, true, 'san_francisco', true, true, 50, ARRAY['toddler','preschool','school-age','tween'], 'https://images.pexels.com/photos/775201/pexels-photo-775201.jpeg'),

('Yerba Buena Gardens', 'Downtown park with an interactive play fountain, carousel, and green space surrounded by cultural institutions. Seasonal ice skating nearby.', ARRAY['outdoor','entertainment'], '750 Howard St', 'San Francisco', 'CA', '94103', 37.7852, -122.4028, true, 'san_francisco', true, true, 40, ARRAY['toddler','preschool','school-age'], 'https://images.pexels.com/photos/1452701/pexels-photo-1452701.jpeg');
