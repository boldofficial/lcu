import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  GraduationCap,
  CreditCard,
  ChevronRight,
  PlayCircle,
  Calendar,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const supabase = await createClient()

  let user, profile, enrollments, courseEnrollments, paymentPlans, upcomingPayments

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      redirect("/auth/login")
    }
    user = userData.user

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = profileData

    // Fetch all dashboard data in parallel
    const [enrollmentsRes, courseEnrollmentsRes, paymentPlansRes, upcomingPaymentsRes] = await Promise.all([
      supabase.from("enrollments").select(`*, program:programs(*)`).eq("student_id", user.id).eq("status", "active"),
      supabase
        .from("course_enrollments")
        .select(`*, course:courses(*)`)
        .eq("student_id", user.id)
        .in("status", ["in_progress", "not_started"])
        .limit(4),
      supabase.from("payment_plans").select("*").eq("student_id", user.id).eq("status", "active"),
      supabase
        .from("payments")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(1),
    ])

    enrollments = enrollmentsRes.data
    courseEnrollments = courseEnrollmentsRes.data
    paymentPlans = paymentPlansRes.data
    upcomingPayments = upcomingPaymentsRes.data
  } catch (error) {
    console.error("[v0] Dashboard page error:", error)
    redirect("/auth/login")
  }

  const firstName = profile?.first_name || "Student"
  const activeEnrollment = enrollments?.[0]
  const totalBalance = paymentPlans?.reduce((sum, plan) => sum + Number(plan.balance), 0) || 0
  const nextPayment = upcomingPayments?.[0]

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Student Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {firstName}!</h2>
            <p className="text-muted-foreground">Continue your learning journey today.</p>
          </div>
          <Link href="/dashboard/courses">
            <Button>
              <PlayCircle className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Program</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{activeEnrollment?.program?.code || "Not Enrolled"}</div>
              <p className="text-xs text-muted-foreground">
                {activeEnrollment?.program?.name || "Enroll in a program to begin"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Credits Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeEnrollment?.credits_completed || 0}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {activeEnrollment?.program?.total_credits || 0}
                </span>
              </div>
              <Progress
                value={
                  activeEnrollment
                    ? (activeEnrollment.credits_completed / (activeEnrollment.program?.total_credits || 1)) * 100
                    : 0
                }
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEnrollment?.gpa?.toFixed(2) || "N/A"}</div>
              <p className="text-xs text-muted-foreground">Cumulative grade point average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Account Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
              {nextPayment && (
                <p className="text-xs text-muted-foreground">
                  Next payment: {new Date(nextPayment.due_date).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Courses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </div>
              <Link href="/dashboard/courses">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {courseEnrollments && courseEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {courseEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{enrollment.course?.code}</span>
                          <Badge variant={enrollment.status === "in_progress" ? "default" : "secondary"}>
                            {enrollment.status === "in_progress" ? "In Progress" : "Not Started"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{enrollment.course?.name}</p>
                        <Progress value={enrollment.progress_percentage} className="h-1.5" />
                      </div>
                      <span className="text-sm font-medium">{enrollment.progress_percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No active courses</p>
                  <Link href="/dashboard/courses" className="mt-2">
                    <Button variant="outline" size="sm">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming & Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">BIB101 - Quiz 2</p>
                      <p className="text-sm text-muted-foreground">Introduction to Old Testament</p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />3 days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">THE201 - Essay</p>
                      <p className="text-sm text-muted-foreground">Systematic Theology I</p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />1 week
                    </Badge>
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
                  <Link href="/dashboard/courses">
                    <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">View Courses</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/grades">
                    <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-xs">View Grades</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/payments">
                    <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                      <CreditCard className="h-5 w-5" />
                      <span className="text-xs">Make Payment</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">My Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
