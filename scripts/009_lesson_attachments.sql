-- Add attachments column to lessons table for multiple file links
-- Format: [{ "name": "Syllabus", "url": "...", "type": "pdf" }]
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Migrate existing resource_url to attachments if needed (optional)
-- UPDATE public.lessons 
-- SET attachments = jsonb_build_array(jsonb_build_object('name', 'Main Resource', 'url', resource_url, 'type', 'document'))
-- WHERE resource_url IS NOT NULL AND jsonb_array_length(attachments) = 0;
