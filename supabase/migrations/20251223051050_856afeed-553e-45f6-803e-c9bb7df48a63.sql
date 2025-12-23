-- Create storage bucket for lead file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-files', 'lead-files', false);

-- Allow anyone to upload files to the lead-files bucket
CREATE POLICY "Anyone can upload lead files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead-files');

-- Allow authenticated users to view lead files
CREATE POLICY "Authenticated users can view lead files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-files' AND auth.role() = 'authenticated');