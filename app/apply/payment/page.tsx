"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import { ChevronLeft, ChevronRight, CreditCard, Building2, Lock, Shield } from "lucide-react"

export default function PaymentPage() {
    const router = useRouter()
    const { setCurrentStep } = useApplication()
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [isProcessing, setIsProcessing] = useState(false)

    const APPLICATION_FEE = 50

    useEffect(() => {
        setCurrentStep(7)
    }, [setCurrentStep])

    async function handlePayment() {
        setIsProcessing(true)
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsProcessing(false)
        router.push("/apply/review")
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={7} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Application Fee</h1>
                <p className="mt-2 text-muted-foreground">
                    Complete your application by paying the non-refundable application fee
                </p>
            </div>

            {/* Fee Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Application Processing Fee</span>
                            <span className="font-medium">${APPLICATION_FEE}.00</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-lg">
                            <span className="font-semibold">Total Due</span>
                            <span className="font-bold text-primary">${APPLICATION_FEE}.00</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Select how you would like to pay</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                        <label
                            htmlFor="card"
                            className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                }`}
                        >
                            <RadioGroupItem value="card" id="card" />
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-medium">Credit / Debit Card</p>
                                <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                            </div>
                        </label>
                        <label
                            htmlFor="bank"
                            className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${paymentMethod === "bank" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                }`}
                        >
                            <RadioGroupItem value="bank" id="bank" />
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-medium">Bank Transfer</p>
                                <p className="text-sm text-muted-foreground">Direct bank transfer (ACH)</p>
                            </div>
                        </label>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Card Details Form */}
            {paymentMethod === "card" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Card Details
                        </CardTitle>
                        <CardDescription>Your payment information is encrypted and secure</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="expiry">Expiration Date</Label>
                                <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" maxLength={4} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input id="cardName" placeholder="John Doe" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bank Transfer Instructions */}
            {paymentMethod === "bank" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Transfer Instructions</CardTitle>
                        <CardDescription>
                            Transfer funds to the following account and include your email as the reference
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                            <div className="grid gap-2">
                                <div>
                                    <span className="text-muted-foreground">Bank Name:</span>
                                    <span className="ml-2 font-medium">First Christian Bank</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Account Name:</span>
                                    <span className="ml-2 font-medium">Landmark Christian University</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Routing Number:</span>
                                    <span className="ml-2 font-medium">021000021</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Account Number:</span>
                                    <span className="ml-2 font-medium">123456789</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Please allow 2-3 business days for bank transfers to be processed.
                            Your application will be marked as complete once payment is confirmed.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secured by 256-bit SSL encryption</span>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/apply/recommendations")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="min-w-[180px]"
                >
                    {isProcessing ? (
                        "Processing..."
                    ) : (
                        <>
                            Pay ${APPLICATION_FEE}.00
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
