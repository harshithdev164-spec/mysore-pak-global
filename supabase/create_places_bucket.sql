-- Create the bucket for place images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('places-image', 'places-image', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow public read access
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'places-image');

-- Allow authenticated uploads/updates/deletes
CREATE POLICY "Authenticated Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'places-image');

CREATE POLICY "Authenticated Update Access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'places-image');

CREATE POLICY "Authenticated Delete Access" ON storage.objects
  FOR DELETE USING (bucket_id = 'places-image');
