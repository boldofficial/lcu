import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateInstallmentPlan } from "@/lib/payments"

import { createPaymentPlanRequestSchema } from "@/lib/validations/payment"

import { headers } from "next/headers"
import { rateLimit } from "@/lib/ratelimit"

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1"
  const { isRateLimited } = await limiter.check(5, ip) // 5 requests per minute

  if (isRateLimited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = createPaymentPlanRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { enrollmentId, planType, installmentCount = 1 } = validation.data

    // Get enrollment details
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*, program:programs(*)")
      .eq("id", enrollmentId)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.student_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const totalAmount = enrollment.program?.tuition_amount || 0

    // Check if payment plan already exists
    const { data: existingPlan } = await supabase
      .from("payment_plans")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active")
      .single()

    if (existingPlan) {
      return NextResponse.json({ error: "Active payment plan already exists" }, { status: 400 })
    }

    // Create payment plan
    const { data: paymentPlan, error: planError } = await supabase
      .from("payment_plans")
      .insert({
        enrollment_id: enrollmentId,
        student_id: user.id,
        total_amount: totalAmount,
        amount_paid: 0,
        balance: totalAmount,
        plan_type: planType,
        installment_count: planType === "full" ? 1 : installmentCount,
        status: "active",
      })
      .select()
      .single()

    if (planError || !paymentPlan) {
      return NextResponse.json({ error: "Failed to create payment plan" }, { status: 500 })
    }

    // Calculate and create installments
    const actualInstallmentCount = planType === "full" ? 1 : installmentCount
    const installments = calculateInstallmentPlan(totalAmount, actualInstallmentCount)

    const paymentRecords = installments.map((installment, index) => ({
      payment_plan_id: paymentPlan.id,
      student_id: user.id,
      amount: installment.amount,
      due_date: installment.dueDate.toISOString(),
      status: "pending" as const,
      installment_number: index + 1,
    }))

    const { error: paymentsError } = await supabase.from("payments").insert(paymentRecords)

    if (paymentsError) {
      // Rollback payment plan if payments failed
      await supabase.from("payment_plans").delete().eq("id", paymentPlan.id)
      return NextResponse.json({ error: "Failed to create payment schedule" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentPlan,
      message: "Payment plan created successfully",
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
