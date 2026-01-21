
-- Fix LMS Schema and RLS for Progress and Grading
-- 1. Add missing columns to course_enrollments
-- 2. Add missing columns to lesson_progress
-- 3. Fix RLS to allow proper updates

DO $$
BEGIN
    -- 1. course_enrollments columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'grade') THEN
        ALTER TABLE course_enrollments ADD COLUMN grade TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'grade_points') THEN
        ALTER TABLE course_enrollments ADD COLUMN grade_points NUMERIC(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'progress_percentage') THEN
        ALTER TABLE course_enrollments ADD COLUMN progress_percentage INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE course_enrollments ADD COLUMN last_accessed_at TIMESTAMPTZ;
    END IF;

    -- 2. lesson_progress columns (if table exists)
    -- Create lesson_progress if it doesn't exist
    CREATE TABLE IF NOT EXISTS lesson_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        progress_percentage INTEGER DEFAULT 0,
        completed_at TIMESTAMPTZ,
        last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(lesson_id, student_id)
    );

END $$;

-- 3. RLS Policies

-- Enable RLS on lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Students can manage own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Faculty can view student progress" ON lesson_progress;

-- Student Policies for lesson_progress
CREATE POLICY "Students can view own progress"
    ON lesson_progress FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can manage own progress"
    ON lesson_progress FOR ALL
    USING (auth.uid() = student_id);

-- Faculty Policies for lesson_progress (View only?)
CREATE POLICY "Faculty can view student progress"
    ON lesson_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN courses c ON m.course_id = c.id
            WHERE l.id = lesson_progress.lesson_id
            AND c.instructor_id = auth.uid()
        )
    );


-- RLS Updates for course_enrollments
-- Enable RLS (should be already enabled)
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can update enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;


-- Faculty needs to update course_enrollments to set grades
CREATE POLICY "Faculty can update enrollments"
    ON course_enrollments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = course_enrollments.course_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Students need to update course_enrollments to set progress
CREATE POLICY "Students can update own enrollments"
    ON course_enrollments FOR UPDATE
    USING (auth.uid() = student_id);
