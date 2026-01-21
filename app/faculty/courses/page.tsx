import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Clock, Pencil, Eye } from "lucide-react"
import Link from "next/link"

export default async function FacultyCoursesPage() {
  const supabase = await createClient()
  console.log("Rendering FacultyCoursesPage")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      program:programs(name, code),
      modules(id),
      course_enrollments(id, student_id, status, progress_percentage)
    `)
    .eq("instructor_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="My Courses" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Management</h2>
            <p className="text-muted-foreground">Manage your assigned courses and content</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => {
            const enrolledStudents = course.course_enrollments?.length || 0
            const avgProgress =
              enrolledStudents > 0
                ? course.course_enrollments.reduce((sum: number, e: any) => sum + (e.progress_percentage || 0), 0) /
                enrolledStudents
                : 0

            return (
              <Card key={course.id} className="overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{course.code}</Badge>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted p-2">
                      <Users className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 text-lg font-semibold">{enrolledStudents}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <BookOpen className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 text-lg font-semibold">{course.modules?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Modules</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 text-lg font-semibold">{course.duration_weeks}</p>
                      <p className="text-xs text-muted-foreground">Weeks</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Student Progress</span>
                      <span className="font-medium">{avgProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/faculty/courses/${course.id}`} className="flex-1">
                      <Button className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View Course
                      </Button>
                    </Link>
                    <Link href={`/faculty/courses/${course.id}`}>
                      <Button variant="outline" size="icon" title="Manage Content">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {(!courses || courses.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No courses assigned to you yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Contact the administration to get courses assigned</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
