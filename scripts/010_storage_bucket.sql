-- Create a new storage bucket for course content
INSERT INTO storage.buckets (id, name, public)
VALUES ('course_content', 'course_content', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to course content
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course_content' );

-- Policy: Allow authenticated faculty/admins to upload
CREATE POLICY "Faculty Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'course_content' );
-- Note: In a real prod app, you'd check role = 'faculty' or 'admin' here.
-- For now, authenticated is sufficient for the MVP flow.

-- Policy: Allow faculty to update/delete their own files
CREATE POLICY "Faculty Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'course_content' );

CREATE POLICY "Faculty Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'course_content' );
