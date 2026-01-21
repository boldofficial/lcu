import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, DollarSign, UserPlus, CircleAlert, CircleCheck } from "lucide-react"
import { AdminStatsCard } from "@/components/admin/admin-stats-card"
import { RecentEnrollmentsTable } from "@/components/admin/recent-enrollments-table"
import { RevenueChart } from "@/components/admin/revenue-chart"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Landmark Christian University administration portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Total Students"
          value={totalStudents || 0}
          description="Active student accounts"
          icon={Users}
          trend="+12% from last month"
          trendUp={true}
        />
        <AdminStatsCard
          title="Active Programs"
          value={totalPrograms || 0}
          description="Degree programs offered"
          icon={GraduationCap}
        />
        <AdminStatsCard
          title="Total Courses"
          value={totalCourses || 0}
          description="Across all programs"
          icon={BookOpen}
        />
        <AdminStatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          description="Current academic year"
          icon={DollarSign}
          trend="+8% from last year"
          trendUp={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">New Enrollment</p>
              <p className="text-sm text-muted-foreground">Register a student</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Add Course</p>
              <p className="text-sm text-muted-foreground">Create new course</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <CircleAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Pending Applications</p>
              <p className="text-sm text-muted-foreground">{pendingApplicationsCount || 0} items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CircleCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Approvals</p>
              <p className="text-sm text-muted-foreground">{pendingPaymentsCount || 0} payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={monthlyData} />
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>Latest student program enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEnrollmentsTable enrollments={recentEnrollments || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
