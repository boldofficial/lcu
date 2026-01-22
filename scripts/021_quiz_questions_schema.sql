-- Quiz Questions and Answers Schema
-- Run this in your Supabase SQL Editor

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer_index INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_index INTEGER,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- Enable RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions
-- Faculty can manage questions for their courses
CREATE POLICY "Faculty can manage quiz questions"
    ON quiz_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN courses c ON a.course_id = c.id
            WHERE a.id = quiz_questions.assessment_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Students can view questions for published assessments they're enrolled in
CREATE POLICY "Students can view quiz questions"
    ON quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN courses c ON a.course_id = c.id
            JOIN course_enrollments ce ON ce.course_id = c.id
            WHERE a.id = quiz_questions.assessment_id
            AND a.is_published = TRUE
            AND ce.student_id = auth.uid()
        )
    );

-- Admin can do everything
CREATE POLICY "Admin full access to quiz questions"
    ON quiz_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quiz_answers
-- Students can manage their own answers
CREATE POLICY "Students can manage own answers"
    ON quiz_answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM assessment_submissions s
            WHERE s.id = quiz_answers.submission_id
            AND s.student_id = auth.uid()
        )
    );

-- Faculty can view answers for their courses
CREATE POLICY "Faculty can view quiz answers"
    ON quiz_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assessment_submissions s
            JOIN assessments a ON s.assessment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE s.id = quiz_answers.submission_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Admin can do everything
CREATE POLICY "Admin full access to quiz answers"
    ON quiz_answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_assessment ON quiz_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON quiz_questions(assessment_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_submission ON quiz_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_quiz_question_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quiz_questions_updated_at ON quiz_questions;

CREATE TRIGGER quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_question_updated_at();
