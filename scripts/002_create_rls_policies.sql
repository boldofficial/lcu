-- Row Level Security Policies for LCU SIS/LMS
-- Security is non-negotiable

-- ============================================
-- PROFILES RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "admin_full_access_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Registrar can view and update student profiles
CREATE POLICY "registrar_manage_profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'registrar')
  );

-- Faculty can view student profiles
CREATE POLICY "faculty_view_profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'faculty')
  );

-- Users can view and update their own profile
CREATE POLICY "users_own_profile_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_own_profile_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PROGRAMS RLS
-- ============================================
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Everyone can view active programs
CREATE POLICY "anyone_view_programs" ON public.programs
  FOR SELECT USING (is_active = true);

-- Admin can manage programs
CREATE POLICY "admin_manage_programs" ON public.programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Registrar can manage programs
CREATE POLICY "registrar_manage_programs" ON public.programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'registrar')
  );

-- ============================================
-- COURSES RLS
-- ============================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view active courses
CREATE POLICY "anyone_view_courses" ON public.courses
  FOR SELECT USING (is_active = true);

-- Admin can manage courses
CREATE POLICY "admin_manage_courses" ON public.courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Faculty can manage their own courses
CREATE POLICY "faculty_manage_own_courses" ON public.courses
  FOR ALL USING (
    instructor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
  );

-- ============================================
-- ENROLLMENTS RLS
-- ============================================
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own enrollments
CREATE POLICY "students_view_own_enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Admin/Registrar can manage all enrollments
CREATE POLICY "staff_manage_enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
  );

-- ============================================
-- COURSE_ENROLLMENTS RLS
-- ============================================
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Students can view their own course enrollments
CREATE POLICY "students_view_own_course_enrollments" ON public.course_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Faculty can view course enrollments for their courses
CREATE POLICY "faculty_view_course_enrollments" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_enrollments.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- Admin/Registrar can manage all course enrollments
CREATE POLICY "staff_manage_course_enrollments" ON public.course_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
  );

-- ============================================
-- MODULES RLS
-- ============================================
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Students can view published modules for enrolled courses
CREATE POLICY "students_view_modules" ON public.modules
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      WHERE ce.student_id = auth.uid() AND c.id = modules.course_id
    )
  );

-- Faculty can manage modules for their courses
CREATE POLICY "faculty_manage_modules" ON public.modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = modules.course_id 
      AND (courses.instructor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- LESSONS RLS
-- ============================================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Students can view published lessons
CREATE POLICY "students_view_lessons" ON public.lessons
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.course_enrollments ce ON ce.course_id = m.course_id
      WHERE m.id = lessons.module_id AND ce.student_id = auth.uid()
    )
  );

-- Faculty can manage lessons
CREATE POLICY "faculty_manage_lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id 
      AND (c.instructor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- LESSON_PROGRESS RLS
-- ============================================
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Students can manage their own progress
CREATE POLICY "students_manage_own_progress" ON public.lesson_progress
  FOR ALL USING (student_id = auth.uid());

-- Faculty can view progress for their courses
CREATE POLICY "faculty_view_progress" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = lesson_progress.lesson_id AND c.instructor_id = auth.uid()
    )
  );

-- ============================================
-- ASSESSMENTS RLS
-- ============================================
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Students can view published assessments
CREATE POLICY "students_view_assessments" ON public.assessments
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = assessments.course_id AND ce.student_id = auth.uid()
    )
  );

-- Faculty can manage assessments
CREATE POLICY "faculty_manage_assessments" ON public.assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = assessments.course_id 
      AND (c.instructor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- ASSESSMENT_QUESTIONS RLS
-- ============================================
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

-- Students can view questions for published assessments
CREATE POLICY "students_view_questions" ON public.assessment_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.course_enrollments ce ON ce.course_id = a.course_id
      WHERE a.id = assessment_questions.assessment_id 
      AND a.is_published = true 
      AND ce.student_id = auth.uid()
    )
  );

-- Faculty can manage questions
CREATE POLICY "faculty_manage_questions" ON public.assessment_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assessment_questions.assessment_id 
      AND (c.instructor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- ASSESSMENT_SUBMISSIONS RLS
-- ============================================
ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can manage their own submissions
CREATE POLICY "students_manage_submissions" ON public.assessment_submissions
  FOR ALL USING (student_id = auth.uid());

-- Faculty can view and grade submissions
CREATE POLICY "faculty_manage_submissions" ON public.assessment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assessment_submissions.assessment_id 
      AND (c.instructor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar')))
    )
  );

-- ============================================
-- PAYMENT_PLANS RLS
-- ============================================
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

-- Students can view their own payment plans
CREATE POLICY "students_view_payment_plans" ON public.payment_plans
  FOR SELECT USING (student_id = auth.uid());

-- Admin/Registrar can manage payment plans
CREATE POLICY "staff_manage_payment_plans" ON public.payment_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
  );

-- ============================================
-- PAYMENTS RLS
-- ============================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Students can view their own payments
CREATE POLICY "students_view_payments" ON public.payments
  FOR SELECT USING (student_id = auth.uid());

-- Admin/Registrar can manage payments
CREATE POLICY "staff_manage_payments" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'registrar'))
  );

-- ============================================
-- ANNOUNCEMENTS RLS
-- ============================================
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can view published announcements
CREATE POLICY "anyone_view_announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

-- Admin/Faculty can manage announcements
CREATE POLICY "staff_manage_announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty', 'registrar'))
  );

-- ============================================
-- DISCUSSION_FORUMS RLS
-- ============================================
ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;

-- Students can view forums for enrolled courses
CREATE POLICY "students_view_forums" ON public.discussion_forums
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = discussion_forums.course_id AND ce.student_id = auth.uid()
    )
  );

-- Faculty can manage forums
CREATE POLICY "faculty_manage_forums" ON public.discussion_forums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = discussion_forums.course_id 
      AND (c.instructor_id = auth.uid() OR
           EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ============================================
-- DISCUSSION_POSTS RLS
-- ============================================
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

-- Users can view posts in accessible forums
CREATE POLICY "users_view_posts" ON public.discussion_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.discussion_forums df
      JOIN public.course_enrollments ce ON ce.course_id = df.course_id
      WHERE df.id = discussion_posts.forum_id AND ce.student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.discussion_forums df
      JOIN public.courses c ON c.id = df.course_id
      WHERE df.id = discussion_posts.forum_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can create posts in accessible forums
CREATE POLICY "users_create_posts" ON public.discussion_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM public.discussion_forums df
        JOIN public.course_enrollments ce ON ce.course_id = df.course_id
        WHERE df.id = discussion_posts.forum_id AND ce.student_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.discussion_forums df
        JOIN public.courses c ON c.id = df.course_id
        WHERE df.id = discussion_posts.forum_id AND c.instructor_id = auth.uid()
      ) OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Users can update their own posts
CREATE POLICY "users_update_own_posts" ON public.discussion_posts
  FOR UPDATE USING (author_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "users_delete_own_posts" ON public.discussion_posts
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
