import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, FileText, ClipboardList, TrendingUp, UserPlus, Search } from "lucide-react"
import Link from "next/link"

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
    <div className="flex flex-col">
      <DashboardHeader title="Registrar Dashboard" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {profile?.first_name || "Registrar"}!</h2>
            <p className="text-muted-foreground">Manage student records and enrollments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search Records
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              New Enrollment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Enrollments</CardTitle>
              <ClipboardList className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{pendingEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Programs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPrograms || 0}</div>
              <p className="text-xs text-muted-foreground">Degree programs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Enrollments</CardTitle>
                  <CardDescription>Latest student program enrollments</CardDescription>
                </div>
                <Link href="/registrar/enrollments">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentEnrollments && recentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {recentEnrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {enrollment.student?.first_name?.[0]}
                          {enrollment.student?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {enrollment.student?.first_name} {enrollment.student?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{enrollment.program?.name}</p>
                        </div>
                      </div>
                      <Badge variant={enrollment.status === "active" ? "default" : "secondary"} className="capitalize">
                        {enrollment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No recent enrollments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common registrar tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/registrar/students">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6 bg-transparent">
                    <Users className="h-6 w-6" />
                    <span>Manage Students</span>
                  </Button>
                </Link>
                <Link href="/registrar/enrollments">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6 bg-transparent">
                    <ClipboardList className="h-6 w-6" />
                    <span>Enrollments</span>
                  </Button>
                </Link>
                <Link href="/registrar/transcripts">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6 bg-transparent">
                    <FileText className="h-6 w-6" />
                    <span>Transcripts</span>
                  </Button>
                </Link>
                <Link href="/registrar/reports">
                  <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6 bg-transparent">
                    <TrendingUp className="h-6 w-6" />
                    <span>Reports</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Enrollment Approvals</p>
                    <p className="text-sm text-muted-foreground">{pendingEnrollments || 0} pending</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Transcript Requests</p>
                    <p className="text-sm text-muted-foreground">3 pending</p>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Graduation Review</p>
                    <p className="text-sm text-muted-foreground">2 applications</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
