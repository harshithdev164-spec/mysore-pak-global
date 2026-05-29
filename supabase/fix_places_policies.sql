-- Enable Row Level Security
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone can see the places)
DROP POLICY IF EXISTS "places_public_read" ON places;
CREATE POLICY "places_public_read" ON places 
  FOR SELECT USING (is_active = true);

-- Allow public updates (temporary for admin tool convenience)
-- In a real production app, this should be restricted to authenticated admins.
DROP POLICY IF EXISTS "places_admin_update" ON places;
CREATE POLICY "places_admin_update" ON places 
  FOR UPDATE USING (true) WITH CHECK (true);

-- Also allow inserts if needed for future place creation
DROP POLICY IF EXISTS "places_admin_insert" ON places;
CREATE POLICY "places_admin_insert" ON places 
  FOR INSERT WITH CHECK (true);
