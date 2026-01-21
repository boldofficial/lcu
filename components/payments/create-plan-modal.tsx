"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { CreditCard, CheckCircle, AlertCircle, Loader2, Calendar } from "lucide-react"
import { formatCurrency, calculateInstallmentPlan } from "@/lib/payments"

interface CreatePlanModalProps {
  enrollment: any
  tuitionAmount: number
}

export function CreatePlanModal({ enrollment, tuitionAmount }: CreatePlanModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [planType, setPlanType] = useState<"full" | "installment">("installment")
  const [installmentCount, setInstallmentCount] = useState(4)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const installments = calculateInstallmentPlan(tuitionAmount, planType === "full" ? 1 : installmentCount)

  const handleCreatePlan = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/create-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          planType,
          installmentCount: planType === "full" ? 1 : installmentCount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create payment plan.")
        setIsCreating(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        router.refresh()
      }, 2000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Setup Payment Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Payment Plan Created!</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Your payment plan has been set up. You can now make payments.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Payment Plan</DialogTitle>
              <DialogDescription>Set up a payment plan for {enrollment.program?.name}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tuition</span>
                  <span className="text-2xl font-bold">{formatCurrency(tuitionAmount)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Payment Plan Type</Label>
                <RadioGroup value={planType} onValueChange={(v) => setPlanType(v as "full" | "installment")}>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">
                      <span className="font-medium">Pay in Full</span>
                      <p className="text-sm text-muted-foreground">Single payment of {formatCurrency(tuitionAmount)}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="installment" id="installment" />
                    <Label htmlFor="installment" className="flex-1 cursor-pointer">
                      <span className="font-medium">Installment Plan</span>
                      <p className="text-sm text-muted-foreground">Split payments over multiple months</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {planType === "installment" && (
                <div className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">{formatCurrency(installments[0].amount)} per month</p>
                </div>
              )}

              <div className="space-y-3">
                <Label>Payment Schedule</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {installments.map((installment, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {installment.dueDate.toLocaleDateString("en-US", {
                            month: "short",
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
