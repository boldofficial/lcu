import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter } from "lucide-react"
import { EditGradeDialog } from "@/components/lms/edit-grade-dialog"

export default async function FacultyGradebookPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get courses taught by this faculty
  const { data: courses } = await supabase.from("courses").select("id, code, name").eq("instructor_id", user?.id)

  // Get all course enrollments for faculty's courses
  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select(`
      *,
      student:profiles(first_name, last_name, email),
      course:courses!inner(id, code, name, instructor_id)
    `)
    .eq("course.instructor_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Gradebook" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Grades</h2>
            <p className="text-muted-foreground">View and manage student grades across your courses</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Grades
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>All Students</CardTitle>
                <CardDescription>{enrollments?.length || 0} students enrolled in your courses</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search students..." className="w-48 pl-9" />
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Current Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments?.map((enrollment: any) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {enrollment.student?.first_name?.[0]}
                          {enrollment.student?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {enrollment.student?.first_name} {enrollment.student?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{enrollment.student?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{enrollment.course?.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{enrollment.progress_percentage || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.grade ? (
                        <Badge
                          variant="outline"
                          className={
                            enrollment.grade_points >= 3.0
                              ? "border-success text-success"
                              : enrollment.grade_points >= 2.0
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
                    <TableCell>
                      <Badge
                        variant={enrollment.status === "completed" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {enrollment.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <EditGradeDialog
                        studentId={enrollment.student_id}
                        courseId={enrollment.course_id}
                        currentGrade={enrollment.grade}
                        studentName={`${enrollment.student?.first_name} ${enrollment.student?.last_name}`}
                        courseName={enrollment.course?.code}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!enrollments || enrollments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No students enrolled in your courses
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
