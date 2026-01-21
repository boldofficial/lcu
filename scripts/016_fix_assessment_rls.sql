-- Fix RLS policies for Assessments and Submissions to allow Student access

-- 1. Assessments: Students should view PUBLISHED assessments for courses they are enrolled in
DROP POLICY IF EXISTS "students_view_assessments" ON public.assessments;

CREATE POLICY "students_view_assessments" ON public.assessments
FOR SELECT USING (
    is_published = true AND (
        EXISTS (
            SELECT 1 FROM public.course_enrollments ce
            WHERE ce.course_id = assessments.course_id
            AND ce.student_id = auth.uid()
            AND ce.status IN ('in_progress', 'not_started', 'completed')
        ) 
        -- Also allow if it's the instructor viewing (already likely covered by manage policy, but safe to add)
        OR EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = assessments.course_id
            AND c.instructor_id = auth.uid()
        )
        OR public.has_role(ARRAY['admin', 'registrar'])
    )
);

-- 2. Assessment Submissions: Students manages their OWN submissions
DROP POLICY IF EXISTS "students_manage_own_submissions" ON public.assessment_submissions;

CREATE POLICY "students_manage_own_submissions" ON public.assessment_submissions
FOR ALL USING (
    student_id = auth.uid()
)
WITH CHECK (
    student_id = auth.uid()
);

-- Note: The previous faculty_manage_submissions policy covers faculty grading.
