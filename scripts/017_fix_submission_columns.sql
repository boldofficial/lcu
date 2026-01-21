-- Fix missing columns in assessment_submissions table
-- This is necessary because if the table already existed, the CREATE TABLE IF NOT EXISTS would not add new columns

DO $$
BEGIN
    -- Add content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'content') THEN
        ALTER TABLE assessment_submissions ADD COLUMN content TEXT;
    END IF;

    -- Add file_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'file_url') THEN
        ALTER TABLE assessment_submissions ADD COLUMN file_url TEXT;
    END IF;

    -- Add submission_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'submission_type') THEN
        ALTER TABLE assessment_submissions ADD COLUMN submission_type TEXT DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'both'));
    END IF;

    -- Add submitted_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'submitted_at') THEN
        ALTER TABLE assessment_submissions ADD COLUMN submitted_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Force schema cache reload by notifying PostgREST (this usually happens automatically on DDL, but good to be sure)
    NOTIFY pgrst, 'reload config';
END $$;
