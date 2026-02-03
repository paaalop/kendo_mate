-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-images' );

-- Policy: Authenticated Upload (Insert)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Users can update/delete their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'community-images' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-images' AND
  auth.uid() = owner
);
