// Mock payment processing utilities for LCU
// This simulates payment processing without requiring Stripe integration

export type PaymentMethod = "card" | "bank" | "check" | "financial_aid"

export interface PaymentRequest {
  amount: number
  paymentPlanId: string
  paymentId: string
  method: PaymentMethod
  cardDetails?: {
    number: string
    expiry: string
    cvv: string
    name: string
  }
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  timestamp: string
}

// Simulate payment processing with mock delay
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

  // Mock validation
  if (request.amount <= 0) {
    return {
      success: false,
      error: "Invalid payment amount",
      timestamp: new Date().toISOString(),
    }
  }

  // Simulate occasional failures (5% chance)
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: "Payment declined. Please try again or use a different payment method.",
      timestamp: new Date().toISOString(),
    }
  }

  // Generate mock transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

  return {
    success: true,
    transactionId,
    timestamp: new Date().toISOString(),
  }
}

// Calculate installment plan
export function calculateInstallmentPlan(
  totalAmount: number,
  installmentCount: number,
): { amount: number; dueDate: Date }[] {
  const baseAmount = Math.floor(totalAmount / installmentCount)
  const remainder = totalAmount - baseAmount * installmentCount

  const installments: { amount: number; dueDate: Date }[] = []
  const today = new Date()

  for (let i = 0; i < installmentCount; i++) {
    const dueDate = new Date(today)
    dueDate.setMonth(dueDate.getMonth() + i)

    // Add remainder to first installment
    const amount = i === 0 ? baseAmount + remainder : baseAmount

    installments.push({ amount, dueDate })
  }

  return installments
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Get payment method display name
export function getPaymentMethodName(method: PaymentMethod): string {
  const names: Record<PaymentMethod, string> = {
    card: "Credit/Debit Card",
    bank: "Bank Transfer (ACH)",
    check: "Check/Money Order",
    financial_aid: "Financial Aid",
  }
  return names[method] || method
}
