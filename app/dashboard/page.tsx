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
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AdminAnalyticsCard } from "@/components/admin/analytics-card"

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
    <div className="flex flex-col pb-10">
      <DashboardHeader title="Student Dashboard" />

      <div className="flex-1 space-y-8 p-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-3xl font-bold text-foreground">
              Welcome back, {firstName} <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
            </h2>
            <p className="text-muted-foreground italic font-medium">Continue your learning journey today.</p>
          </div>
          <Link href="/dashboard/courses">
            <Button size="lg" className="rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-primary/20">
              <PlayCircle className="mr-2 h-5 w-5" />
              Continue Learning
            </Button>
          </Link>
        </div>

        {/* Stats Cards - Colorful & Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdminAnalyticsCard
            title="Current Program"
            value={activeEnrollment?.program?.code || "Not Enrolled"}
            description={activeEnrollment?.program?.name || "Enroll now to begin"}
            icon={GraduationCap}
            gradient="purple"
          />

          <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-500/20 to-emerald-700/10 dark:from-emerald-500/30 dark:to-emerald-700/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full">
                  Progress
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {activeEnrollment?.credits_completed || 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {activeEnrollment?.program?.total_credits || 0}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-1">Credits Completed</p>
              <Progress
                value={
                  activeEnrollment
                    ? (activeEnrollment.credits_completed / (activeEnrollment.program?.total_credits || 1)) * 100
                    : 0
                }
                className="mt-4 h-2 bg-emerald-100 dark:bg-emerald-900/30 shadow-inner"
              />
            </CardContent>
          </Card>

          <AdminAnalyticsCard
            title="Current GPA"
            value={activeEnrollment?.gpa?.toFixed(2) || "N/A"}
            description="Cumulative academic performance"
            icon={BookOpen}
            gradient="gold"
          />

          <AdminAnalyticsCard
            title="Account Balance"
            value={`$${totalBalance.toLocaleString()}`}
            description={nextPayment ? `Next: ${new Date(nextPayment.due_date).toLocaleDateString()}` : "No pending payments"}
            icon={CreditCard}
            gradient="cyan"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Current Courses */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-md overflow-hidden h-full">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">My Courses</CardTitle>
                    <CardDescription>Courses enrolled for the current term</CardDescription>
                  </div>
                  <Link href="/dashboard/courses">
                    <Button variant="ghost" size="sm" className="hover:text-primary">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {courseEnrollments && courseEnrollments.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {courseEnrollments.map((enrollment, i) => (
                      <div
                        key={enrollment.id}
                        className={cn(
                          "group relative flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-lg hover:-translate-y-1",
                          enrollment.status === "in_progress" ? "border-primary/20 bg-primary/5" : "border-muted"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            i % 4 === 0 ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400" :
                              i % 4 === 1 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" :
                                i % 4 === 2 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" :
                                  "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400"
                          )}>
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <Badge variant={enrollment.status === "in_progress" ? "default" : "secondary"} className="rounded-full px-3">
                            {enrollment.status === "in_progress" ? "Resuming" : "Start Now"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{enrollment.course?.code}</p>
                          <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{enrollment.course?.name}</p>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                            <span>PROGRESS</span>
                            <span>{enrollment.progress_percentage}%</span>
                          </div>
                          <Progress value={enrollment.progress_percentage} className="h-1.5" />
                        </div>
                        <Link href={`/dashboard/courses/${enrollment.course_id}`} className="absolute inset-0">
                          <span className="sr-only">Go to course</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="font-semibold text-foreground">No active courses found</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      You are not currently enrolled in any courses for this term.
                    </p>
                    <Link href="/dashboard/courses" className="mt-6">
                      <Button variant="outline" className="rounded-full">
                        Explore Catalog
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Deadlines - Colorful Urgency */}
            <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-rose-500/5 to-transparent">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-rose-500" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { title: "BIB101 - Quiz 2", desc: "Old Testament Intro", time: "3 days", type: "urgent" },
                    { title: "THE201 - Essay", desc: "Systematic Theology I", time: "1 week", type: "upcoming" }
                  ].map((deadline, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border bg-card/50 p-4 hover:border-rose-200 transition-colors">
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground">{deadline.desc}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1 rounded-full",
                          deadline.type === "urgent" ? "border-rose-500/20 text-rose-600 bg-rose-50" : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {deadline.time}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Floating & Colorful */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { href: "/dashboard/courses", label: "Courses", icon: BookOpen, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
                    { href: "/dashboard/grades", label: "Grades", icon: GraduationCap, color: "bg-gold-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
                    { href: "/dashboard/payments", label: "Payments", icon: CreditCard, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400" },
                    { href: "/dashboard/profile", label: "Profile", icon: Calendar, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
                  ].map((action, i) => (
                    <Link key={i} href={action.href}>
                      <div className="group flex flex-col items-center gap-3 rounded-2xl border border-muted-foreground/10 p-4 transition-all hover:scale-105 hover:shadow-md hover:bg-muted/30">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:rotate-12", action.color)}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">{action.label}</span>
                      </div>
                    </Link>
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
