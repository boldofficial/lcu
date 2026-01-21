import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, ClipboardList, MessageSquare, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function FacultyDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Get courses assigned to this faculty member
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      program:programs(name, code),
      course_enrollments(id, student_id, status)
    `)
    .eq("instructor_id", user?.id)

  // Get pending assessments to grade
  const { data: pendingSubmissions } = await supabase
    .from("assessment_submissions")
    .select(`
      *,
      assessment:assessments(title, course_id),
      student:profiles(first_name, last_name)
    `)
    .eq("status", "submitted")
    .limit(5)

  const totalStudents =
    courses?.reduce((sum, course) => {
      const uniqueStudents = new Set(course.course_enrollments?.map((e: any) => e.student_id))
      return sum + uniqueStudents.size
    }, 0) || 0

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Faculty Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {profile?.first_name || "Professor"}!</h2>
            <p className="text-muted-foreground">Manage your courses and students</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Grading</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingSubmissions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Submissions to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Discussions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Active threads</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Courses you are currently teaching</CardDescription>
                </div>
                <Link href="/faculty/courses">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {courses && courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.slice(0, 4).map((course) => {
                    const studentCount = new Set(course.course_enrollments?.map((e: any) => e.student_id)).size
                    return (
                      <div key={course.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{course.code}</span>
                              <Badge variant="outline">{course.credits} Credits</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{course.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{studentCount}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No courses assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Grading */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Grading</CardTitle>
                  <CardDescription>Submissions awaiting your review</CardDescription>
                </div>
                <Link href="/faculty/gradebook">
                  <Button variant="outline" size="sm">
                    Grade All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingSubmissions && pendingSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission: any) => (
                    <div key={submission.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{submission.assessment?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.student?.first_name} {submission.student?.last_name}
                        </p>
                      </div>
                      <Button size="sm">Grade</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No pending submissions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Office Hours</p>
                    <p className="text-sm text-muted-foreground">Virtual Meeting Room</p>
                  </div>
                  <Badge variant="outline">Today, 2:00 PM</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">BIB201 Exam Deadline</p>
                    <p className="text-sm text-muted-foreground">Midterm Exam</p>
                  </div>
                  <Badge variant="outline">Tomorrow</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Faculty Meeting</p>
                    <p className="text-sm text-muted-foreground">Department Review</p>
                  </div>
                  <Badge variant="outline">Friday, 10:00 AM</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/faculty/courses">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs">Manage Courses</span>
                  </Button>
                </Link>
                <Link href="/faculty/assessments">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                    <ClipboardList className="h-5 w-5" />
                    <span className="text-xs">Create Assessment</span>
                  </Button>
                </Link>
                <Link href="/faculty/gradebook">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Gradebook</span>
                  </Button>
                </Link>
                <Link href="/faculty/discussions">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs">Discussions</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
