import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, Calendar, CheckCircle, Clock, Download } from "lucide-react"
import { PaymentModal } from "@/components/payments/payment-modal"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: paymentPlans } = await supabase
    .from("payment_plans")
    .select(`
      *,
      enrollment:enrollments(
        program:programs(name, code)
      ),
      payments(*)
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  const activeplan = paymentPlans?.find((p) => p.status === "active")
  const allPayments = paymentPlans?.flatMap((p) => p.payments || []) || []

  const totalPaid = allPayments
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + p.amount, 0)

  const totalBalance = paymentPlans?.reduce((sum, p) => sum + p.balance, 0) || 0

  const nextPayment = allPayments
    .filter((p: any) => p.status === "pending")
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Payments & Financial Aid" />

      <div className="flex-1 space-y-6 p-6">
        {/* Financial Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">${totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Payments received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextPayment ? (
                <>
                  <div className="text-3xl font-bold">${nextPayment.amount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(nextPayment.due_date).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">No pending payments</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Payment Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className="text-lg" variant={activeplan ? "default" : "secondary"}>
                {activeplan?.plan_type === "installment"
                  ? "Installment"
                  : activeplan?.plan_type === "full"
                    ? "Paid in Full"
                    : "None"}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeplan ? `${activeplan.installment_count} installments` : "No active plan"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Payment Plan */}
        {activeplan && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Payment Plan</CardTitle>
                  <CardDescription>
                    {activeplan.enrollment?.program?.name} - {activeplan.enrollment?.program?.code}
                  </CardDescription>
                </div>
                <PaymentModal paymentPlan={activeplan} nextPayment={nextPayment} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Progress</span>
                <span className="font-medium">
                  ${activeplan.amount_paid.toLocaleString()} of ${activeplan.total_amount.toLocaleString()}
                </span>
              </div>
              <Progress value={(activeplan.amount_paid / activeplan.total_amount) * 100} className="h-3" />
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">Total Tuition</p>
                  <p className="text-lg font-semibold">${activeplan.total_amount.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-lg font-semibold text-success">${activeplan.amount_paid.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold text-warning">${activeplan.balance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Tabs defaultValue="upcoming">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Statement
            </Button>
          </div>

          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Your scheduled payment installments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Installment</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments
                      .filter((p: any) => p.status === "pending")
                      .sort((a: any, b: any) => a.installment_number - b.installment_number)
                      .map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">Installment #{payment.installment_number}</TableCell>
                          <TableCell>
                            {new Date(payment.due_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="font-semibold">${payment.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm">Pay Now</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {allPayments.filter((p: any) => p.status === "pending").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No upcoming payments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Record of all your payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments
                      .filter((p: any) => p.status === "paid")
                      .sort((a: any, b: any) => new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime())
                      .map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="font-medium">
                            Tuition Payment - Installment #{payment.installment_number}
                          </TableCell>
                          <TableCell className="capitalize">{payment.payment_method || "—"}</TableCell>
                          <TableCell className="font-semibold text-success">
                            ${payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-success gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Paid
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    {allPayments.filter((p: any) => p.status === "paid").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No payment history
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
