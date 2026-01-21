-- Add resource_url to lessons table to store links to PDFs/Docs
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS resource_url TEXT;
