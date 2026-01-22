import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, DollarSign, UserPlus, CircleAlert, CircleCheck, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react"
import { AdminAnalyticsCard } from "@/components/admin/analytics-card"
import { RecentEnrollmentsTable } from "@/components/admin/recent-enrollments-table"
import { EnrollmentTrendsChart } from "@/components/admin/enrollment-trends-chart"
import { ProgramDistributionChart } from "@/components/admin/program-distribution-chart"
import { ApplicationFunnelChart } from "@/components/admin/application-funnel-chart"
import { RevenueComparisonChart } from "@/components/admin/revenue-comparison-chart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalStudents },
    { count: totalPrograms },
    { count: totalCourses },
    { count: activeEnrollments },
    { data: recentEnrollments },
    { count: pendingPaymentsCount },
    { data: payments },
    { count: pendingApplicationsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("programs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("enrollments")
      .select(`
        *,
        student:profiles!enrollments_student_id_fkey(first_name, last_name, email),
        program:programs(name, degree_type)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("payment_plans").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("payments").select("amount, paid_date").eq("status", "paid").gte("paid_date", `${new Date().getFullYear()}-01-01`),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "submitted"),
  ])

  // Calculate Real Revenue
  let totalRevenue = 0
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(0, i)
    return { month: d.toLocaleString('en-US', { month: 'short' }), revenue: 0, index: i }
  })

  if (payments) {
    payments.forEach((p) => {
      totalRevenue += p.amount
      if (p.paid_date) {
        const monthIndex = new Date(p.paid_date).getMonth()
        if (monthlyData[monthIndex]) {
          monthlyData[monthIndex].revenue += p.amount
        }
      }
    })
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground italic">Welcome back to the Landmark Christian University administration hub</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1 text-sm font-medium text-primary border border-primary/10">
          <Activity className="h-4 w-4" />
          System Status: Healthy
        </div>
      </div>

      {/* Stats Grid - Colorful & Premium */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminAnalyticsCard
          title="Total Students"
          value={totalStudents || 0}
          description="Enrolled in active programs"
          icon={Users}
          trend="+12.5%"
          trendUp={true}
          gradient="purple"
        />
        <AdminAnalyticsCard
          title="Active Programs"
          value={totalPrograms || 0}
          description="Spanning 5 departments"
          icon={GraduationCap}
          trend="+2"
          trendUp={true}
          gradient="gold"
        />
        <AdminAnalyticsCard
          title="Total Courses"
          value={totalCourses || 0}
          description="Live in the LMS system"
          icon={BookOpen}
          gradient="emerald"
        />
        <AdminAnalyticsCard
          title="Annual Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          description="Goal: $250k for 2026"
          icon={DollarSign}
          trend="+8.2%"
          trendUp={true}
          gradient="cyan"
        />
      </div>

      {/* Quick Actions - More Vibrant */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "New Enrollment", desc: "Register student", icon: UserPlus, color: "text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400" },
          { label: "Add Course", desc: "LMS workspace", icon: BookOpen, color: "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400" },
          { label: "Pending Apps", desc: `${pendingApplicationsCount || 0} to review`, icon: CircleAlert, color: "text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400" },
          { label: "Approvals", desc: `${pendingPaymentsCount || 0} payments`, icon: CircleCheck, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" },
        ].map((action, i) => (
          <Card key={i} className="group cursor-pointer border-none shadow-sm transition-all hover:scale-105">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-colors", action.color)}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section - New Visuals */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue and Distribution */}
        <RevenueComparisonChart />
        <ProgramDistributionChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationFunnelChart />
        <EnrollmentTrendsChart />
      </div>

      {/* Secondary Data Section */}
      <div className="grid gap-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Enrollments</CardTitle>
                <CardDescription>Latest student program enrollments across all degrees</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RecentEnrollmentsTable enrollments={recentEnrollments || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
