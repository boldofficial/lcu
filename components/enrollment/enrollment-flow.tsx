"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  Clock,
  DollarSign,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, calculateInstallmentPlan } from "@/lib/payments"
import type { Program } from "@/lib/types"

interface EnrollmentFlowProps {
  programs: Program[]
  studentId: string
}

type Step = "program" | "payment" | "confirm" | "complete"

export function EnrollmentFlow({ programs, studentId }: EnrollmentFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("program")
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [planType, setPlanType] = useState<"full" | "installment">("installment")
  const [installmentCount, setInstallmentCount] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { id: "program", label: "Select Program" },
    { id: "payment", label: "Payment Plan" },
    { id: "confirm", label: "Confirm" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)
  const progressPercent = step === "complete" ? 100 : ((currentStepIndex + 1) / steps.length) * 100

  const installments = selectedProgram
    ? calculateInstallmentPlan(selectedProgram.tuition_amount, planType === "full" ? 1 : installmentCount)
    : []

  const handleSubmit = async () => {
    if (!selectedProgram) return

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from("enrollments")
        .insert({
          student_id: studentId,
          program_id: selectedProgram.id,
          status: "active",
          enrollment_date: new Date().toISOString(),
          expected_completion_date: new Date(
            Date.now() + selectedProgram.duration_months * 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          gpa: 0,
          credits_completed: 0,
        })
        .select()
        .single()

      if (enrollError) throw enrollError

      // Create payment plan
      const actualInstallmentCount = planType === "full" ? 1 : installmentCount
      const { data: paymentPlan, error: planError } = await supabase
        .from("payment_plans")
        .insert({
          enrollment_id: enrollment.id,
          student_id: studentId,
          total_amount: selectedProgram.tuition_amount,
          amount_paid: 0,
          balance: selectedProgram.tuition_amount,
          plan_type: planType,
          installment_count: actualInstallmentCount,
          status: "active",
        })
        .select()
        .single()

      if (planError) throw planError

      // Create payment records
      const paymentRecords = installments.map((installment, index) => ({
        payment_plan_id: paymentPlan.id,
        student_id: studentId,
        amount: installment.amount,
        due_date: installment.dueDate.toISOString(),
        status: "pending" as const,
        installment_number: index + 1,
      }))

      const { error: paymentsError } = await supabase.from("payments").insert(paymentRecords)

      if (paymentsError) throw paymentsError

      // Enroll in first courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("program_id", selectedProgram.id)
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .limit(3)

      if (courses && courses.length > 0) {
        const courseEnrollments = courses.map((course, index) => ({
          enrollment_id: enrollment.id,
          course_id: course.id,
          student_id: studentId,
          status: index === 0 ? "in_progress" : ("not_started" as const),
          progress_percentage: 0,
        }))

        await supabase.from("course_enrollments").insert(courseEnrollments)
      }

      setStep("complete")
    } catch (err: any) {
      setError(err.message || "Failed to complete enrollment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const degreeTypeLabels: Record<string, string> = {
    certificate: "Certificate",
    associate: "Associate",
    bachelor: "Bachelor's",
    master: "Master's",
    doctorate: "Doctorate",
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Progress Header */}
      {step !== "complete" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`ml-2 hidden text-sm md:inline ${index <= currentStepIndex ? "font-medium" : "text-muted-foreground"}`}
                >
                  {s.label}
                </span>
                {index < steps.length - 1 && <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground md:mx-4" />}
              </div>
            ))}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Program Selection */}
      {step === "program" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Select Your Program</h2>
            <p className="text-muted-foreground">Choose the degree program that aligns with your calling</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((program) => (
              <Card
                key={program.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProgram?.id === program.id ? "border-primary ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedProgram(program)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{degreeTypeLabels[program.degree_type] || program.degree_type}</Badge>
                    {selectedProgram?.id === program.id && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded bg-muted p-2">
                      <BookOpen className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 font-medium">{program.total_credits}</p>
                      <p className="text-xs text-muted-foreground">Credits</p>
                    </div>
                    <div className="rounded bg-muted p-2">
                      <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 font-medium">{program.duration_months}</p>
                      <p className="text-xs text-muted-foreground">Months</p>
                    </div>
                    <div className="rounded bg-muted p-2">
                      <DollarSign className="mx-auto h-4 w-4 text-muted-foreground" />
                      <p className="mt-1 font-medium">${(program.tuition_amount / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">Tuition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep("payment")} disabled={!selectedProgram}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Plan */}
      {step === "payment" && selectedProgram && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Choose Your Payment Plan</h2>
            <p className="text-muted-foreground">Select how you would like to pay for your education</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{selectedProgram.name}</CardTitle>
              <CardDescription>Total Tuition: {formatCurrency(selectedProgram.tuition_amount)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={planType} onValueChange={(v) => setPlanType(v as "full" | "installment")}>
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Pay in Full</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Single payment of {formatCurrency(selectedProgram.tuition_amount)}
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="installment" id="installment" />
                  <Label htmlFor="installment" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Installment Plan</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Split payments over multiple months</p>
                  </Label>
                </div>
              </RadioGroup>

              {planType === "installment" && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label>Number of Installments</Label>
                    <span className="font-medium">{installmentCount} payments</span>
                  </div>
                  <Slider
                    value={[installmentCount]}
                    onValueChange={([value]) => setInstallmentCount(value)}
                    min={2}
                    max={12}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(installments[0]?.amount || 0)} per month
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Payment Schedule</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-4">
                  {installments.map((installment, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">
                          {installment.dueDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(installment.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("program")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep("confirm")}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirm" && selectedProgram && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Confirm Your Enrollment</h2>
            <p className="text-muted-foreground">Review your selections before completing enrollment</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enrollment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Program</Label>
                  <p className="font-medium">{selectedProgram.name}</p>
                  <Badge variant="outline">{degreeTypeLabels[selectedProgram.degree_type]}</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedProgram.duration_months} months</p>
                  <p className="text-sm text-muted-foreground">{selectedProgram.total_credits} credit hours</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Payment Plan</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Total Tuition</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedProgram.tuition_amount)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Payment Type</p>
                    <p className="text-lg font-bold capitalize">{planType}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Installments</p>
                    <p className="text-lg font-bold">{planType === "full" ? 1 : installmentCount}</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  By clicking "Complete Enrollment", you agree to the terms and conditions of Landmark Christian
                  University and acknowledge the payment plan selected above.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("payment")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Enrollment"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && selectedProgram && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Welcome to LCU!</h2>
            <p className="mt-2 text-center text-muted-foreground">
              You have successfully enrolled in {selectedProgram.name}
            </p>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Your first payment of {formatCurrency(installments[0]?.amount || 0)} is due{" "}
              {installments[0]?.dueDate.toLocaleDateString()}
            </p>
            <div className="mt-8 flex gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard/payments")}>
                View Payment Plan
              </Button>
              <Button onClick={() => router.push("/dashboard/courses")}>
                Start Learning
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
