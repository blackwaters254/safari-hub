-- Make applications bucket private
UPDATE storage.buckets SET public = false WHERE id = 'applications';

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view application docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload application docs" ON storage.objects;

-- Allow anyone to upload (applicants need to upload docs)
CREATE POLICY "Authenticated and anon can upload application docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'applications');

-- Only admins can view/download application documents
CREATE POLICY "Admins can view application docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'applications' AND has_role(auth.uid(), 'admin'::app_role));