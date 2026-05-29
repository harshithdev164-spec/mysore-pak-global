-- ─────────────────────────────────────────────────────────
-- Tour Guide places table — seed/migrate data from src/data/places.ts.
-- Matches the schema already used by `fetchPlaceDetail` and the
-- /tour-guide/place/[id] page.
--
-- Run once in the Supabase SQL editor.
-- Re-runnable: ON CONFLICT updates existing rows by id.
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS places (
  id            TEXT PRIMARY KEY,                  -- slug-style identifier (e.g. "mysore-palace")
  name          TEXT NOT NULL,
  emoji         TEXT,                              -- single emoji for cards (🏰, 🌺, ⛰️, …)
  category      TEXT NOT NULL CHECK (category IN ('heritage','temple','nature','culture','food','adventure')),
  description   TEXT NOT NULL,                     -- short card description
  long_description TEXT,                           -- optional fuller story for detail page
  entry_fee     TEXT,                              -- 'Free' | '₹70' | '₹250' …
  best_time     TEXT,                              -- 'Morning', 'Sunday evening', …
  time_needed   TEXT,                              -- '1-2 hours'
  rating        NUMERIC(2,1),                      -- 4.6
  tip           TEXT,                              -- one-line visitor tip
  hours         TEXT,                              -- detailed opening hours, optional
  image_url     TEXT,                              -- override; if null, derive from places-image bucket
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS places_category_idx ON places (category);
CREATE INDEX IF NOT EXISTS places_active_order_idx ON places (is_active, display_order);

-- Auto-update updated_at if the trigger function exists
DROP TRIGGER IF EXISTS set_places_updated_at ON places;
CREATE TRIGGER set_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Allow public read access (RLS): tour-guide is public-facing
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "places_public_read" ON places;
CREATE POLICY "places_public_read" ON places FOR SELECT USING (is_active = true);

-- ─────────────────────────────────────────────────────────
-- Seed data (matches src/data/places.ts).
-- Note: image_url is NULL → frontend will derive from the places-image bucket
-- using `<id>.jpg`. Override per-row if you store images elsewhere.
-- ─────────────────────────────────────────────────────────

INSERT INTO places (id, name, emoji, category, description, entry_fee, best_time, time_needed, rating, tip, hours, lat, lng, display_order)
VALUES
('mysore-palace', 'Mysore Palace', '🏰', 'heritage',
  'The magnificent royal residence of the Wadiyar dynasty, adorned with Indo-Saracenic architecture. A breathtaking sight when illuminated with 97,000 bulbs on Sundays and festivals.',
  '₹70', 'Morning or Sunday evening', '2-3 hours', 4.8,
  'Visit on a Sunday evening to see the palace illuminated.',
  '10:00 AM – 5:30 PM (Light show: Sun 7-7:45 PM)',
  12.3052, 76.6552, 1),

('chamundi-hills', 'Chamundi Hills', '⛰️', 'temple',
  'A sacred hilltop temple dedicated to Goddess Chamundeshwari, offering panoramic views of Mysore city. The giant Nandi bull statue on the way up is iconic.',
  'Free', 'Early morning', '2 hours', 4.6,
  'Climb the 1,000 steps for a rewarding experience.',
  '7:30 AM – 2:00 PM, 3:30 PM – 6:00 PM, 7:30 PM – 9:00 PM',
  12.2724, 76.6703, 2),

('brindavan-gardens', 'Brindavan Gardens', '⛲', 'nature',
  'Terraced gardens built across the Krishna Raja Sagara dam, famous for the musical fountain show that dances to light and music every evening.',
  '₹30', 'Evening (fountain show)', '2-3 hours', 4.4,
  'Arrive by 6 PM to get a good spot for the fountain show.',
  '6:30 AM – 8:00 PM (Fountain: 7:00 PM weekdays, 7:30 PM weekends)',
  12.4214, 76.5728, 3),

('mysore-zoo', 'Mysore Zoo', '🦁', 'nature',
  'One of the oldest and most well-maintained zoos in India, home to a wide variety of animals, birds, and reptiles in naturalistic enclosures.',
  '₹100', 'Morning', '3 hours', 4.5,
  'Closed on Tuesdays. Carry water — lots of walking!',
  '8:30 AM – 5:30 PM (Closed Tuesdays)',
  12.3023, 76.6634, 4),

('karanji-lake', 'Karanji Lake', '🦢', 'nature',
  'A serene lake with a walk-through aviary and butterfly park, right next to the zoo. The lake''s boardwalk offers lovely views and bird-watching.',
  '₹20', 'Morning or late afternoon', '1-2 hours', 4.3,
  'Great for photography, especially during migration season.',
  '8:30 AM – 5:30 PM (Closed Tuesdays)',
  12.2965, 76.6640, 5),

('devaraja-market', 'Devaraja Market', '🌺', 'food',
  'A bustling 130-year-old market bursting with colors, spices, flowers, and local delicacies. The perfect place to experience authentic Mysore culture.',
  'Free', 'Morning', '1-2 hours', 4.4,
  'Try the fresh Mysore Pak from the local stalls.',
  '6:00 AM – 9:00 PM',
  12.3103, 76.6530, 6),

('st-philomena-church', 'St. Philomena''s Church', '⛪', 'heritage',
  'One of the tallest churches in Asia, built in Neo-Gothic style with stunning stained glass windows depicting scenes from the Bible.',
  'Free', 'Morning', '1 hour', 4.5,
  'The underground crypt is a hidden gem worth visiting.',
  '5:00 AM – 6:00 PM',
  12.3183, 76.6560, 7),

('jaganmohan-palace', 'Jaganmohan Palace', '🎨', 'culture',
  'A grand palace now serving as an art gallery, housing a remarkable collection of paintings, sculptures, and royal artifacts including works by Raja Ravi Varma.',
  '₹50', 'Morning', '1-2 hours', 4.3,
  'Photography is not allowed inside.',
  '8:30 AM – 5:00 PM',
  12.3068, 76.6510, 8),

('lalitha-mahal', 'Lalitha Mahal Palace', '👑', 'heritage',
  'A stunning white palatial hotel built in 1921 for the Viceroy of India, inspired by St. Paul''s Cathedral in London. Now a luxury heritage hotel.',
  'Free (exterior)', 'Afternoon', '1 hour', 4.4,
  'Have high tea at the restaurant for a royal experience.',
  'Open 24 hours (hotel)',
  12.2930, 76.6680, 9),

('world-of-mysore-pak', 'World of Mysore Pak', '🍫', 'food',
  'Famous shop selling authentic Mysore Pak — the signature sweet of Mysore. Walk in, smell the ghee, taste history.',
  'Free', 'Morning', '30 mins', 4.6,
  'Buy early before it runs out.',
  '8:00 AM – 9:30 PM',
  12.3100, 76.6480, 10),

('silk-emporium', 'Silk Emporium', '🧵', 'culture',
  'Traditional silk weaving center showcasing beautiful Mysore silk sarees and fabrics — watch the looms in action.',
  'Free', 'Morning', '1-2 hours', 4.4,
  'Watch weavers at work on traditional looms.',
  '10:00 AM – 6:30 PM',
  12.3130, 76.6510, 11),

('sand-museum', 'Sand Museum', '🏜️', 'culture',
  'Unique museum featuring intricate sand sculptures and art — over 150 sculptures across 16 themes.',
  '₹50', 'Morning', '1 hour', 4.2,
  'Photography not allowed for sculptures.',
  '9:00 AM – 6:30 PM',
  12.2880, 76.6550, 12),

('rail-museum', 'Rail Museum', '🚂', 'culture',
  'Historic open-air railway museum with vintage steam locomotives and the Maharaja''s saloon coach.',
  '₹30', 'Morning', '2 hours', 4.3,
  'Great for photography enthusiasts.',
  '9:30 AM – 7:00 PM (Closed Mondays)',
  12.3020, 76.6700, 13),

('nanjangudu', 'Nanjangudu', '🏛️', 'temple',
  'Ancient temple town famous for Srikanteshwara Temple and local jaggery — a scenic 25 km drive from Mysuru.',
  'Free', 'Morning', '2-3 hours', 4.5,
  'Visit the old temple during festival time.',
  '6:30 AM – 1:00 PM, 4:00 PM – 8:30 PM',
  12.1630, 76.7050, 14),

('shuka-vana', 'Shuka Vana Bird Sanctuary', '🦅', 'nature',
  'Serene rehab sanctuary for over 2,000 exotic birds across 600+ species — the world''s largest aviary of rescued birds.',
  '₹50', 'Early morning', '2 hours', 4.4,
  'Visit early for best bird sightings.',
  '8:30 AM – 5:30 PM (Closed Mondays)',
  12.3250, 76.5950, 15),

('wax-museum', 'Wax Museum', '🎭', 'culture',
  'Museum featuring life-sized wax figures of celebrities and historical personalities.',
  '₹150', 'Afternoon', '1-2 hours', 4.2,
  'Perfect for family photos with wax figures.',
  '9:30 AM – 7:00 PM',
  12.3200, 76.6400, 16),

('payana-vintage-cars', 'Payana Vintage Cars Museum', '🚗', 'culture',
  'Amazing collection of vintage and classic cars from across the world — Rolls-Royces, Bentleys, and more.',
  '₹200', 'Afternoon', '1-2 hours', 4.5,
  'Car enthusiasts will love this place.',
  '10:00 AM – 6:00 PM',
  12.3600, 76.6200, 17),

('shrirangapatna', 'Shrirangapatna Island', '🏰', 'heritage',
  'Historic island fortress on the Kaveri river — Tipu Sultan''s capital, with palaces, mausoleums, and a 9th-century Vishnu temple.',
  '₹30', 'Morning', '2-3 hours', 4.5,
  'Rich historical significance — hire a local guide.',
  '9:00 AM – 5:00 PM',
  12.4150, 76.6850, 18),

('ranganathittu', 'Ranganathittu Bird Sanctuary', '🦆', 'nature',
  'Scenic bird sanctuary on the Kaveri River with painted storks, pelicans, and migratory ducks. Boat rides available.',
  '₹40', 'Early morning', '2 hours', 4.6,
  'Best during migration season (Oct-Feb).',
  '8:30 AM – 6:00 PM',
  12.4280, 76.6900, 19),

('lokaranjan-aqua', 'Lokaranjan Aqua Park', '🌊', 'nature',
  'Fun water park with pools, slides and water attractions — set in landscaped gardens.',
  '₹250', 'Afternoon', '2-3 hours', 4.3,
  'Bring sunscreen and towels.',
  '10:30 AM – 6:00 PM',
  12.4050, 76.6150, 20),

('grs-fantasy-park', 'GRS Fantasy Park', '🎡', 'adventure',
  'Adventure and amusement park with rides and water attractions for the whole family.',
  '₹300', 'Afternoon', '3-4 hours', 4.4,
  'Go on weekdays for fewer crowds.',
  '10:30 AM – 6:30 PM',
  12.3950, 76.5950, 21),

('grs-snow-park', 'GRS Snow Park', '⛄', 'adventure',
  'Unique snow-themed park with artificial snow and ice slides — a chilly adventure in tropical Karnataka.',
  '₹350', 'Afternoon', '2-3 hours', 4.5,
  'Bring warm clothes despite the AC.',
  '11:00 AM – 7:00 PM',
  12.3900, 76.5900, 22),

('grs-updown-museum', 'GRS Up Down Museum', '🎨', 'culture',
  '3D art museum with interactive optical illusions and upside-down exhibits — Instagram heaven.',
  '₹250', 'Afternoon', '1-2 hours', 4.4,
  'Fun for family photos with illusions.',
  '11:00 AM – 7:00 PM',
  12.3850, 76.5850, 23)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  entry_fee = EXCLUDED.entry_fee,
  best_time = EXCLUDED.best_time,
  time_needed = EXCLUDED.time_needed,
  rating = EXCLUDED.rating,
  tip = EXCLUDED.tip,
  hours = EXCLUDED.hours,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
