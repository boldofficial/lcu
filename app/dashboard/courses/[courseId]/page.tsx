import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { CourseContentView } from "@/components/lms/course-content-view"

interface CoursePageProps {
  params: Promise<{ courseId: string }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get course with modules and lessons
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      program:programs(name, code),
      instructor:profiles(first_name, last_name, bio),
      modules(
        *,
        lessons(*)
      )
    `)
    .eq("id", courseId)
    .single()

  if (!course) notFound()

  // Get student's enrollment in this course
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("course_id", courseId)
    .eq("student_id", user.id)
    .single()

  // Get assessments for this course
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("created_at", { ascending: true })

  // Get student's assessment submissions
  const { data: submissions } = await supabase
    .from("assessment_submissions")
    .select("*")
    .eq("student_id", user.id)
    .in("assessment_id", assessments?.map((a) => a.id) || [])

  // Get student's lesson progress
  const { data: lessonProgress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, completed_at")
    .eq("student_id", user.id)

  // Sort modules and lessons by order_index
  const sortedModules =
    course.modules
      ?.sort((a: any, b: any) => a.order_index - b.order_index)
      .map((module: any) => ({
        ...module,
        lessons: module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || [],
      })) || []

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={course.name}
        breadcrumbs={[{ label: "Courses", href: "/dashboard/courses" }, { label: course.code }]}
      />
      <CourseContentView
        course={{ ...course, modules: sortedModules }}
        enrollment={enrollment}
        assessments={assessments || []}
        submissions={submissions || []}
        lessonProgress={lessonProgress || []}
      />
    </div>
  )
}
