import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { processPayment, type PaymentMethod } from "@/lib/payments"

import { paymentProcessSchema } from "@/lib/validations/payment"

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
    const validation = paymentProcessSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { paymentId, paymentPlanId, amount, method, cardDetails } = validation.data

    // Verify the payment belongs to this user
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, payment_plan:payment_plans(*)")
      .eq("id", paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.payment_plan?.student_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (payment.status === "paid") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
    }

    // Process the payment using our mock payment processor
    const result = await processPayment({
      amount,
      paymentPlanId,
      paymentId,
      method: method as PaymentMethod,
      cardDetails,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_date: result.timestamp,
        payment_method: method,
        transaction_id: result.transactionId,
      })
      .eq("id", paymentId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update payment record" }, { status: 500 })
    }

    // Update payment plan totals
    const newAmountPaid = (payment.payment_plan?.amount_paid || 0) + amount
    const newBalance = (payment.payment_plan?.total_amount || 0) - newAmountPaid

    await supabase
      .from("payment_plans")
      .update({
        amount_paid: newAmountPaid,
        balance: newBalance,
        status: newBalance <= 0 ? "completed" : "active",
      })
      .eq("id", paymentPlanId)

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      message: "Payment processed successfully",
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
