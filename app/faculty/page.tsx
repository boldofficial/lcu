import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, ClipboardList, MessageSquare, Calendar, TrendingUp, Sparkles, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AdminAnalyticsCard } from "@/components/admin/analytics-card"
import { cn } from "@/lib/utils"

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
    <div className="flex flex-col pb-10">
      <DashboardHeader title="Faculty Dashboard" />

      <div className="flex-1 space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-3xl font-bold">
              Welcome, {profile?.first_name || "Professor"} <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground italic font-medium">Empower your students through excellence in teaching.</p>
          </div>
          <div className="hidden md:block">
            <Link href="/faculty/courses">
              <Button className="rounded-full shadow-lg">Manage All Courses</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Colorful & Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdminAnalyticsCard
            title="My Courses"
            value={courses?.length || 0}
            description="Active teaching assignments"
            icon={BookOpen}
            gradient="purple"
          />

          <AdminAnalyticsCard
            title="Total Students"
            value={totalStudents}
            description="Across your enrollment groups"
            icon={Users}
            gradient="emerald"
          />

          <AdminAnalyticsCard
            title="Pending Grading"
            value={pendingSubmissions?.length || 0}
            description="Assessments waiting review"
            icon={ClipboardList}
            gradient="gold"
            trend={pendingSubmissions && pendingSubmissions.length > 0 ? "Action Required" : "Clean Slate"}
            trendUp={!(pendingSubmissions && pendingSubmissions.length > 5)}
          />

          <AdminAnalyticsCard
            title="Discussions"
            value="5"
            description="Active threads this week"
            icon={MessageSquare}
            gradient="cyan"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Active Courses */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-md overflow-hidden h-full">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Current Courses</CardTitle>
                    <CardDescription>Courses assigned to your profile this semester</CardDescription>
                  </div>
                  <Link href="/faculty/courses">
                    <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {courses && courses.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {courses.slice(0, 4).map((course, i) => {
                      const studentCount = new Set(course.course_enrollments?.map((e: any) => e.student_id)).size
                      return (
                        <div key={course.id} className="group relative flex flex-col gap-4 rounded-2xl border border-muted bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
                          <div className="flex items-center justify-between">
                            <div className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:rotate-6",
                              i % 4 === 0 ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400" :
                                i % 4 === 1 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" :
                                  i % 4 === 2 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" :
                                    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400"
                            )}>
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold leading-none">{studentCount}</p>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">Students</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground/70 tracking-widest uppercase">{course.code}</p>
                            <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{course.name}</h4>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Badge variant="secondary" className="bg-muted/50 text-[10px] px-2">{course.credits} Credits</Badge>
                            <Badge variant="outline" className="text-[10px] px-2 truncate max-w-[120px]">{course.program?.name}</Badge>
                          </div>
                          <Link href={`/faculty/courses/${course.id}`} className="absolute inset-0">
                            <span className="sr-only">Go to course</span>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-lg font-semibold">No courses assigned yet</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      Please contact the administration if you believe this is an error.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Pending Grading - Urgent Look */}
            <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-amber-500" />
                    Pending Grading
                  </CardTitle>
                  <Link href="/faculty/gradebook">
                    <Button variant="link" size="sm" className="h-auto p-0 text-amber-600">Review all</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {pendingSubmissions && pendingSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {pendingSubmissions.map((submission: any) => (
                      <div key={submission.id} className="flex items-center justify-between rounded-xl border border-muted bg-card/50 p-4 transition-all hover:bg-muted/30">
                        <div className="space-y-1">
                          <p className="font-bold text-sm leading-none">{submission.assessment?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted by <span className="text-foreground font-medium">{submission.student?.first_name} {submission.student?.last_name}</span>
                          </p>
                        </div>
                        <Link href={`/faculty/assessments/${submission.assessment?.id}/submissions/${submission.id}`}>
                          <Button size="sm" variant="outline" className="h-8 rounded-full border-amber-500/20 text-amber-600 hover:bg-amber-50">Grade</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">All submissions graded!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Schedule - Branded Slots */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { label: "Office Hours", place: "Virtual Meeting Room", time: "Today, 2:00 PM", color: "bg-purple-600" },
                    { label: "BIB201 Exam Setup", place: "LMS Canvas", time: "Tomorrow", color: "bg-amber-500" },
                    { label: "Faculty Sync", place: "Main Hall", time: "Friday, 10:00 AM", color: "bg-emerald-600" }
                  ].map((event, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={cn("mt-1.5 h-2 w-2 rounded-full", event.color)} />
                      <div className="flex-1 space-y-1 border-b border-muted pb-3 last:border-0 last:pb-0">
                        <p className="font-bold text-sm leading-none">{event.label}</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">{event.place}</p>
                          <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-bold border-muted-foreground/10">{event.time}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
