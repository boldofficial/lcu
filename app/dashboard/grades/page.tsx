import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GraduationCap, TrendingUp, Award, BookOpen } from "lucide-react"

export default async function GradesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      program:programs(*)
    `)
    .eq("student_id", user.id)

  const { data: courseEnrollments } = await supabase
    .from("course_enrollments")
    .select(`
      *,
      course:courses(code, name, credits)
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  const activeEnrollment = enrollments?.[0]
  const completedCourses = courseEnrollments?.filter((c) => c.status === "completed") || []
  const inProgressCourses = courseEnrollments?.filter((c) => c.status === "in_progress") || []

  // Calculate statistics
  const totalCreditsEarned = completedCourses.reduce((sum, c) => sum + (c.course?.credits || 0), 0)
  const totalCreditsAttempted = courseEnrollments?.reduce((sum, c) => sum + (c.course?.credits || 0), 0) || 0

  const gradePoints: Record<string, number> = {
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0.0,
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Grades & Academic Record" />

      <div className="flex-1 space-y-6 p-6">
        {/* GPA Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cumulative GPA</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{activeEnrollment?.gpa?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Out of 4.00 scale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Credits Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalCreditsEarned}
                <span className="text-lg font-normal text-muted-foreground">
                  /{activeEnrollment?.program?.total_credits || 0}
                </span>
              </div>
              <Progress
                value={
                  activeEnrollment?.program?.total_credits
                    ? (totalCreditsEarned / activeEnrollment.program.total_credits) * 100
                    : 0
                }
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Courses Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCourses.length}</div>
              <p className="text-xs text-muted-foreground">{inProgressCourses.length} in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Academic Standing</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge
                variant="default"
                className={
                  (activeEnrollment?.gpa || 0) >= 3.5
                    ? "bg-success"
                    : (activeEnrollment?.gpa || 0) >= 2.0
                      ? "bg-primary"
                      : "bg-warning"
                }
              >
                {(activeEnrollment?.gpa || 0) >= 3.5
                  ? "Dean's List"
                  : (activeEnrollment?.gpa || 0) >= 2.0
                    ? "Good Standing"
                    : "Academic Warning"}
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">Based on cumulative GPA</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Course Grades</CardTitle>
            <CardDescription>Your academic record for all completed and in-progress courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Grade Points</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseEnrollments?.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-mono font-medium">{enrollment.course?.code}</TableCell>
                    <TableCell>{enrollment.course?.name}</TableCell>
                    <TableCell>{enrollment.course?.credits}</TableCell>
                    <TableCell>
                      {enrollment.grade ? (
                        <Badge
                          variant="outline"
                          className={
                            gradePoints[enrollment.grade] >= 3.0
                              ? "border-success text-success"
                              : gradePoints[enrollment.grade] >= 2.0
                                ? "border-primary text-primary"
                                : "border-warning text-warning"
                          }
                        >
                          {enrollment.grade}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{enrollment.grade_points?.toFixed(2) || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={enrollment.status === "completed" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {enrollment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!courseEnrollments || courseEnrollments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No course records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* GPA Calculator Info */}
        <Card>
          <CardHeader>
            <CardTitle>Grading Scale</CardTitle>
            <CardDescription>LCU uses a standard 4.0 grading scale for all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-12">
              {Object.entries(gradePoints).map(([grade, points]) => (
                <div key={grade} className="rounded-lg bg-muted p-2 text-center">
                  <p className="font-semibold">{grade}</p>
                  <p className="text-sm text-muted-foreground">{points.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
