-- Quiz Enhancements Schema
-- Adds timer, shuffle, and feedback settings to assessments
-- Run this in your Supabase SQL Editor

-- Add quiz enhancement columns to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER DEFAULT NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS show_feedback BOOLEAN DEFAULT TRUE;

-- Add started_at to track when quiz was started (for timer)
ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NULL;

-- Comment for clarity
COMMENT ON COLUMN assessments.time_limit_minutes IS 'Time limit in minutes for quiz completion. NULL means no time limit.';
COMMENT ON COLUMN assessments.shuffle_questions IS 'Whether to randomize question order for each student.';
COMMENT ON COLUMN assessments.show_feedback IS 'Whether to show correct answers after quiz submission.';
COMMENT ON COLUMN assessment_submissions.started_at IS 'When the student started the quiz (for timer tracking).';
