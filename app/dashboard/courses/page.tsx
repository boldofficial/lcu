import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Play, CheckCircle, Lock } from "lucide-react"
import Link from "next/link"

export default async function CoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: courseEnrollments } = await supabase
    .from("course_enrollments")
    .select(`
      *,
      course:courses(
        *,
        program:programs(name, code),
        instructor:profiles(first_name, last_name)
      )
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  const inProgress = courseEnrollments?.filter((e) => e.status === "in_progress") || []
  const notStarted = courseEnrollments?.filter((e) => e.status === "not_started") || []
  const completed = courseEnrollments?.filter((e) => e.status === "completed") || []

  return (
    <div className="flex flex-col">
      <DashboardHeader title="My Courses" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Catalog</h2>
            <p className="text-muted-foreground">Track your progress and continue learning</p>
          </div>
        </div>

        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="not-started">Not Started ({notStarted.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgress.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <EmptyState message="No courses in progress" />
            )}
          </TabsContent>

          <TabsContent value="not-started" className="space-y-4">
            {notStarted.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notStarted.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <EmptyState message="No courses waiting to start" />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completed.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completed.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <EmptyState message="No completed courses yet" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function CourseCard({ enrollment }: { enrollment: any }) {
  const statusColors = {
    in_progress: "bg-primary",
    not_started: "bg-muted",
    completed: "bg-success",
  }

  const statusIcons = {
    in_progress: Play,
    not_started: Lock,
    completed: CheckCircle,
  }

  const StatusIcon = statusIcons[enrollment.status as keyof typeof statusIcons] || Play

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className={`h-2 ${statusColors[enrollment.status as keyof typeof statusColors]}`} />
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant="outline">{enrollment.course?.code}</Badge>
          <Badge variant={enrollment.status === "completed" ? "default" : "secondary"} className="capitalize">
            {enrollment.status.replace("_", " ")}
          </Badge>
        </div>
        <CardTitle className="text-lg">{enrollment.course?.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {enrollment.course?.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{enrollment.course?.credits} Credits</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{enrollment.course?.duration_weeks} Weeks</span>
          </div>
        </div>

        {enrollment.course?.instructor && (
          <p className="text-sm text-muted-foreground">
            Instructor: {enrollment.course.instructor.first_name} {enrollment.course.instructor.last_name}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{enrollment.progress_percentage}%</span>
          </div>
          <Progress value={enrollment.progress_percentage} className="h-2" />
        </div>

        {enrollment.grade && (
          <div className="flex items-center justify-between rounded-lg bg-muted p-2">
            <span className="text-sm">Grade</span>
            <Badge>{enrollment.grade}</Badge>
          </div>
        )}

        <Link href={`/dashboard/courses/${enrollment.course?.id}`}>
          <Button className="w-full" variant={enrollment.status === "completed" ? "outline" : "default"}>
            <StatusIcon className="mr-2 h-4 w-4" />
            {enrollment.status === "completed"
              ? "Review Course"
              : enrollment.status === "not_started"
                ? "Start Course"
                : "Continue"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
