-- Fix infinite recursion in RLS policies
-- The issue: policies on profiles table query profiles table, causing recursion
-- The fix: Use a security definer function to bypass RLS when checking role

-- Drop existing problematic policies
DROP POLICY IF EXISTS "admin_full_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "registrar_manage_profiles" ON public.profiles;
DROP POLICY IF EXISTS "faculty_view_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_insert" ON public.profiles;

-- Create a security definer function to get user role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create a helper function to check if current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = ANY(allowed_roles)
  );
$$;

-- Recreate profiles policies using the security definer function
-- Users can always view and update their own profile
CREATE POLICY "users_own_profile_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_own_profile_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can do everything on profiles
CREATE POLICY "admin_full_access_profiles" ON public.profiles
  FOR ALL USING (public.has_role(ARRAY['admin']));

-- Registrar can view and update all profiles
CREATE POLICY "registrar_manage_profiles" ON public.profiles
  FOR ALL USING (public.has_role(ARRAY['registrar']));

-- Faculty can view all profiles
CREATE POLICY "faculty_view_profiles" ON public.profiles
  FOR SELECT USING (public.has_role(ARRAY['faculty']));

-- Now fix all other tables that reference profiles for role checks
-- Drop and recreate policies using the helper function

-- PROGRAMS
DROP POLICY IF EXISTS "admin_manage_programs" ON public.programs;
DROP POLICY IF EXISTS "registrar_manage_programs" ON public.programs;

CREATE POLICY "admin_manage_programs" ON public.programs
  FOR ALL USING (public.has_role(ARRAY['admin']));

CREATE POLICY "registrar_manage_programs" ON public.programs
  FOR ALL USING (public.has_role(ARRAY['registrar']));

-- COURSES
DROP POLICY IF EXISTS "admin_manage_courses" ON public.courses;
DROP POLICY IF EXISTS "faculty_manage_own_courses" ON public.courses;

CREATE POLICY "admin_manage_courses" ON public.courses
  FOR ALL USING (public.has_role(ARRAY['admin']));

CREATE POLICY "faculty_manage_own_courses" ON public.courses
  FOR ALL USING (
    instructor_id = auth.uid() OR
    public.has_role(ARRAY['admin', 'registrar'])
  );

-- ENROLLMENTS
DROP POLICY IF EXISTS "staff_manage_enrollments" ON public.enrollments;

CREATE POLICY "staff_manage_enrollments" ON public.enrollments
  FOR ALL USING (public.has_role(ARRAY['admin', 'registrar']));

-- COURSE_ENROLLMENTS
DROP POLICY IF EXISTS "staff_manage_course_enrollments" ON public.course_enrollments;

CREATE POLICY "staff_manage_course_enrollments" ON public.course_enrollments
  FOR ALL USING (public.has_role(ARRAY['admin', 'registrar']));

-- MODULES
DROP POLICY IF EXISTS "faculty_manage_modules" ON public.modules;

CREATE POLICY "faculty_manage_modules" ON public.modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = modules.course_id 
      AND courses.instructor_id = auth.uid()
    ) OR public.has_role(ARRAY['admin'])
  );

-- LESSONS
DROP POLICY IF EXISTS "faculty_manage_lessons" ON public.lessons;

CREATE POLICY "faculty_manage_lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id 
      AND c.instructor_id = auth.uid()
    ) OR public.has_role(ARRAY['admin'])
  );

-- ASSESSMENTS
DROP POLICY IF EXISTS "faculty_manage_assessments" ON public.assessments;

CREATE POLICY "faculty_manage_assessments" ON public.assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = assessments.course_id 
      AND c.instructor_id = auth.uid()
    ) OR public.has_role(ARRAY['admin'])
  );

-- ASSESSMENT_QUESTIONS
DROP POLICY IF EXISTS "faculty_manage_questions" ON public.assessment_questions;

CREATE POLICY "faculty_manage_questions" ON public.assessment_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assessment_questions.assessment_id 
      AND c.instructor_id = auth.uid()
    ) OR public.has_role(ARRAY['admin'])
  );

-- ASSESSMENT_SUBMISSIONS
DROP POLICY IF EXISTS "faculty_manage_submissions" ON public.assessment_submissions;

CREATE POLICY "faculty_manage_submissions" ON public.assessment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assessment_submissions.assessment_id 
      AND c.instructor_id = auth.uid()
    ) OR public.has_role(ARRAY['admin', 'registrar'])
  );

-- PAYMENT_PLANS
DROP POLICY IF EXISTS "staff_manage_payment_plans" ON public.payment_plans;

CREATE POLICY "staff_manage_payment_plans" ON public.payment_plans
  FOR ALL USING (public.has_role(ARRAY['admin', 'registrar']));

-- PAYMENTS
DROP POLICY IF EXISTS "staff_manage_payments" ON public.payments;

CREATE POLICY "staff_manage_payments" ON public.payments
  FOR ALL USING (public.has_role(ARRAY['admin', 'registrar']));

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "staff_manage_announcements" ON public.announcements;

CREATE POLICY "staff_manage_announcements" ON public.announcements
  FOR ALL USING (public.has_role(ARRAY['admin', 'faculty', 'registrar']));

-- DISCUSSION_FORUMS
DROP POLICY IF EXISTS "faculty_manage_forums" ON public.discussion_forums;

CREATE POLICY "faculty_manage_forums" ON public.discussion_forums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = discussion_forums.course_id 
      AND c.instructor_id = auth.uid()
    ) OR public.has_role(ARRAY['admin'])
  );

-- DISCUSSION_POSTS
DROP POLICY IF EXISTS "users_view_posts" ON public.discussion_posts;
DROP POLICY IF EXISTS "users_create_posts" ON public.discussion_posts;
DROP POLICY IF EXISTS "users_delete_own_posts" ON public.discussion_posts;

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
    public.has_role(ARRAY['admin'])
  );

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
      public.has_role(ARRAY['admin'])
    )
  );

CREATE POLICY "users_delete_own_posts" ON public.discussion_posts
  FOR DELETE USING (
    author_id = auth.uid() OR
    public.has_role(ARRAY['admin'])
  );
