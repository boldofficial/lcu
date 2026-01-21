-- Add cover_image to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS cover_image TEXT;
