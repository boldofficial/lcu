import { z } from "zod"

export const paymentProcessSchema = z.object({
    paymentId: z.string().uuid(),
    paymentPlanId: z.string().uuid(),
    amount: z.number().positive(),
    method: z.enum(["card", "bank", "check", "financial_aid"]),
    cardDetails: z.object({
        number: z.string(),
        expiry: z.string(),
        cvv: z.string(),
        name: z.string()
    }).optional()
})

export const createPaymentPlanRequestSchema = z.object({
    enrollmentId: z.string().uuid(),
    planType: z.enum(["full", "installment"]),
    installmentCount: z.number().int().min(1).max(12).optional().default(1)
})
