import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, FileText, ClipboardList, TrendingUp, UserPlus, Search, Sparkles, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { AdminAnalyticsCard } from "@/components/admin/analytics-card"
import { cn } from "@/lib/utils"

export default async function RegistrarDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Get statistics
  const [
    { count: totalStudents },
    { count: activeEnrollments },
    { count: pendingEnrollments },
    { count: totalPrograms },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("programs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("enrollments")
      .select(`
        *,
        student:profiles!enrollments_student_id_fkey(first_name, last_name, email),
        program:programs(name, code, degree_type)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return (
    <div className="flex flex-col pb-10">
      <DashboardHeader title="Registrar Dashboard" />

      <div className="flex-1 space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-3xl font-bold">
              Greetings, {profile?.first_name || "Registrar"} <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-muted-foreground italic font-medium">Upholding academic integrity and student success.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full shadow-sm hover:bg-muted/50 border-muted">
              <Search className="mr-2 h-4 w-4" />
              Search Records
            </Button>
            <Link href="/registrar/enrollments/new">
              <Button className="rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                <UserPlus className="mr-2 h-4 w-4" />
                New Enrollment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Colorful & Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AdminAnalyticsCard
            title="Total Students"
            value={totalStudents || 0}
            description="Registered across all programs"
            icon={Users}
            gradient="purple"
          />

          <AdminAnalyticsCard
            title="Active Enrollments"
            value={activeEnrollments || 0}
            description="Students currently in session"
            icon={GraduationCap}
            gradient="emerald"
          />

          <AdminAnalyticsCard
            title="Pending Approvals"
            value={pendingEnrollments || 0}
            description="Enrollments awaiting review"
            icon={ClipboardList}
            gradient="gold"
            trend={pendingEnrollments && pendingEnrollments > 0 ? "Action Required" : "Up to Date"}
            trendUp={!(pendingEnrollments && pendingEnrollments > 10)}
          />

          <AdminAnalyticsCard
            title="Active Programs"
            value={totalPrograms || 0}
            description="Available degree offerings"
            icon={FileText}
            gradient="cyan"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Recent Enrollments */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-md overflow-hidden h-full">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Enrollments</CardTitle>
                    <CardDescription>Latest student program assignments</CardDescription>
                  </div>
                  <Link href="/registrar/enrollments">
                    <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {recentEnrollments && recentEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {recentEnrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="group relative flex items-center justify-between rounded-2xl border border-muted bg-card/50 p-4 transition-all hover:bg-muted/30 hover:shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shadow-inner">
                            {enrollment.student?.first_name?.[0]}
                            {enrollment.student?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-base leading-none group-hover:text-primary transition-colors">
                              {enrollment.student?.first_name} {enrollment.student?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{enrollment.program?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden md:block text-right">
                            <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-tighter">{enrollment.program?.code}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(enrollment.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={enrollment.status === "active" ? "default" : "secondary"} className={cn(
                            "capitalize font-bold px-3 py-1 rounded-full text-[10px]",
                            enrollment.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none" : "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none"
                          )}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <Link href={`/registrar/enrollments/${enrollment.id}`} className="absolute inset-0">
                          <span className="sr-only">View enrollment details</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 border-2 border-dashed border-muted">
                      <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-lg font-semibold">No recent enrollments</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      Student registration activity will appear here once processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions - Floating & Colorful */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Students", icon: Users, href: "/registrar/students", color: "text-purple-600 bg-purple-100" },
                    { label: "Enrollments", icon: ClipboardList, href: "/registrar/enrollments", color: "text-emerald-600 bg-emerald-100" },
                    { label: "Transcripts", icon: FileText, href: "/registrar/transcripts", color: "text-amber-600 bg-amber-100" },
                    { label: "Analytics", icon: TrendingUp, href: "/registrar/reports", color: "text-cyan-600 bg-cyan-100" }
                  ].map((action, i) => (
                    <Link key={i} href={action.href} className="group">
                      <div className="flex flex-col items-center gap-3 rounded-2xl border border-muted p-4 transition-all hover:border-primary/20 hover:shadow-md hover:-translate-y-1 bg-card">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110", action.color)}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">{action.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks - Actionable Look */}
            <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-bold">Priority Tasks</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-sm transition-transform group-hover:rotate-6">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-none truncate">Enrollment Approvals</p>
                    <p className="text-xs text-muted-foreground mt-1">{pendingEnrollments || 0} awaiting review</p>
                  </div>
                  <Link href="/registrar/enrollments?status=pending">
                    <Button size="sm" variant="outline" className="h-8 rounded-full border-amber-500/20 text-amber-600 hover:bg-amber-50 font-bold px-3">Review</Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-sm transition-transform group-hover:rotate-6">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-none truncate">Transcript Requests</p>
                    <p className="text-xs text-muted-foreground mt-1">3 new requests</p>
                  </div>
                  <Link href="/registrar/transcripts">
                    <Button size="sm" variant="outline" className="h-8 rounded-full border-purple-500/20 text-purple-600 hover:bg-purple-50 font-bold px-3">Process</Button>
                  </Link>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm transition-transform group-hover:rotate-6">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-none truncate">Graduation Review</p>
                    <p className="text-xs text-muted-foreground mt-1">2 eligibility checks</p>
                  </div>
                  <Link href="/registrar/graduation">
                    <Button size="sm" variant="outline" className="h-8 rounded-full border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 font-bold px-3">Verify</Button>
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
