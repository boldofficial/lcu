
-- Fix missing grading columns in assessment_submissions table
-- This script adds the columns required for the grading functionality

DO $$
BEGIN
    -- Add grade column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'grade') THEN
        ALTER TABLE assessment_submissions ADD COLUMN grade NUMERIC;
    END IF;

    -- Add feedback column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'feedback') THEN
        ALTER TABLE assessment_submissions ADD COLUMN feedback TEXT;
    END IF;

    -- Add graded_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'graded_at') THEN
        ALTER TABLE assessment_submissions ADD COLUMN graded_at TIMESTAMPTZ;
    END IF;

    -- Add graded_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_submissions' AND column_name = 'graded_by') THEN
        ALTER TABLE assessment_submissions ADD COLUMN graded_by UUID REFERENCES auth.users(id);
    END IF;
END $$;
