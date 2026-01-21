-- Assessment Submissions Schema
-- Run this in your Supabase SQL Editor

-- Add new columns to assessments table
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'both'));

-- Create assessment_submissions table
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('file', 'text')),
    file_url TEXT,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
    grade NUMERIC(5,2),
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assessment_id, student_id)
);

-- Enable RLS
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (for idempotent re-runs)
DROP POLICY IF EXISTS "Students can view own submissions" ON assessment_submissions;
DROP POLICY IF EXISTS "Students can create submissions" ON assessment_submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON assessment_submissions;
DROP POLICY IF EXISTS "Faculty can view course submissions" ON assessment_submissions;
DROP POLICY IF EXISTS "Faculty can grade submissions" ON assessment_submissions;
DROP POLICY IF EXISTS "Admin full access to submissions" ON assessment_submissions;

-- RLS Policies for assessment_submissions
-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
    ON assessment_submissions FOR SELECT
    USING (auth.uid() = student_id);

-- Students can insert their own submissions
CREATE POLICY "Students can create submissions"
    ON assessment_submissions FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Students can update their own draft submissions
CREATE POLICY "Students can update own submissions"
    ON assessment_submissions FOR UPDATE
    USING (auth.uid() = student_id AND status IN ('draft', 'submitted'));

-- Faculty can view submissions for their courses
CREATE POLICY "Faculty can view course submissions"
    ON assessment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN courses c ON a.course_id = c.id
            WHERE a.id = assessment_submissions.assessment_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Faculty can update submissions (for grading)
CREATE POLICY "Faculty can grade submissions"
    ON assessment_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN courses c ON a.course_id = c.id
            WHERE a.id = assessment_submissions.assessment_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admin can do everything
CREATE POLICY "Admin full access to submissions"
    ON assessment_submissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assessment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assessment_submissions(status);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_submission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger first (for idempotent re-runs)
DROP TRIGGER IF EXISTS assessment_submissions_updated_at ON assessment_submissions;

CREATE TRIGGER assessment_submissions_updated_at
    BEFORE UPDATE ON assessment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_submission_updated_at();

