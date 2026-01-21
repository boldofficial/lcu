import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, DollarSign, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  const { data: paymentPlans } = await supabase
    .from("payment_plans")
    .select(`
      *,
      enrollment:enrollments(
        student:profiles!enrollments_student_id_fkey(first_name, last_name, email, student_id),
        program:programs(name)
      ),
      payments(*)
    `)
    .order("created_at", { ascending: false })

  const totalCollected =
    paymentPlans?.reduce((sum, plan) => {
      const paid =
        plan.payments?.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + p.amount, 0) || 0
      return sum + paid
    }, 0) || 0

  const totalPending =
    paymentPlans?.reduce((sum, plan) => {
      const pending =
        plan.payments?.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + p.amount, 0) || 0
      return sum + pending
    }, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage tuition payments and payment plans</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-2xl font-bold">${totalCollected.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">${totalPending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Plans</p>
              <p className="text-2xl font-bold">{paymentPlans?.filter((p) => p.status === "active").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">$0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Payment Plans</CardTitle>
              <CardDescription>View and manage student payment plans</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." className="w-48 pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Installments</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentPlans?.map((plan) => {
                const paidAmount =
                  plan.payments
                    ?.filter((p: any) => p.status === "completed")
                    .reduce((s: number, p: any) => s + p.amount, 0) || 0
                const balance = plan.total_amount - paidAmount

                return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {plan.enrollment?.student?.first_name} {plan.enrollment?.student?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{plan.enrollment?.student?.student_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{plan.enrollment?.program?.name}</TableCell>
                    <TableCell className="font-medium">${plan.total_amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-success">${paidAmount.toLocaleString()}</TableCell>
                    <TableCell className={balance > 0 ? "text-warning" : ""}>${balance.toLocaleString()}</TableCell>
                    <TableCell>
                      {plan.payments?.filter((p: any) => p.status === "completed").length || 0} /{" "}
                      {plan.installment_count}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          plan.status === "completed"
                            ? "default"
                            : plan.status === "active"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!paymentPlans || paymentPlans.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No payment plans found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
