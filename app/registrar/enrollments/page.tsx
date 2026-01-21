import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react"

export default async function RegistrarEnrollmentsPage() {
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      student:profiles!enrollments_student_id_fkey(first_name, last_name, email),
      program:programs(name, code, degree_type, tuition_amount)
    `)
    .order("created_at", { ascending: false })

  const pendingEnrollments = enrollments?.filter((e) => e.status === "pending") || []
  const activeEnrollments = enrollments?.filter((e) => e.status === "active") || []
  const completedEnrollments = enrollments?.filter((e) => e.status === "completed") || []

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Enrollment Management" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enrollments</h2>
            <p className="text-muted-foreground">Manage student program enrollments</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            New Enrollment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingEnrollments.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeEnrollments.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedEnrollments.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enrollments?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingEnrollments.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeEnrollments.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedEnrollments.length})</TabsTrigger>
              <TabsTrigger value="all">All ({enrollments?.length || 0})</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search enrollments..." className="w-64 pl-9" />
            </div>
          </div>

          <TabsContent value="pending" className="mt-4">
            <EnrollmentTable enrollments={pendingEnrollments} showActions />
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <EnrollmentTable enrollments={activeEnrollments} />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <EnrollmentTable enrollments={completedEnrollments} />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <EnrollmentTable enrollments={enrollments || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EnrollmentTable({ enrollments, showActions = false }: { enrollments: any[]; showActions?: boolean }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead>Tuition</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
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
                  <div>
                    <Badge variant="outline">{enrollment.program?.code}</Badge>
                    <p className="mt-1 text-sm text-muted-foreground">{enrollment.program?.name}</p>
                  </div>
                </TableCell>
                <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  ${enrollment.program?.tuition_amount?.toLocaleString() || 0}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      enrollment.status === "active"
                        ? "default"
                        : enrollment.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="capitalize"
                  >
                    {enrollment.status}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="default">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="mr-1 h-4 w-4" />
                        Deny
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {enrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={showActions ? 6 : 5} className="h-32 text-center text-muted-foreground">
                  No enrollments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
