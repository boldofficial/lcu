"use client"

import { useEffect, useState } from "react"
import { submitApplication } from "@/app/actions/submit-application"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import {
    ChevronLeft,
    Send,
    User,
    GraduationCap,
    FileText,
    BookOpen,
    Users,
    CreditCard,
    CheckCircle2,
    Loader2
} from "lucide-react"

export default function ReviewPage() {
    const router = useRouter()
    const { setCurrentStep, formData } = useApplication()
    const [agreed, setAgreed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setCurrentStep(8)
    }, [setCurrentStep])

    async function handleSubmit() {
        if (!agreed) return

        setIsSubmitting(true)
        try {
            const result = await submitApplication(formData)

            if (result.success) {
                toast.success("Application submitted successfully!")
                router.push("/apply/status")
            } else {
                toast.error(result.error || "Failed to submit application")
            }
        } catch (error) {
            toast.error("An error occurred during submission")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const sections = [
        {
            title: "Program Selection",
            icon: GraduationCap,
            path: "/apply",
            complete: !!formData.program_id,
            items: [
                { label: "Selected Program", value: "Program ID: " + (formData.program_id || "Not selected") },
            ],
        },
        {
            title: "Personal Information",
            icon: User,
            path: "/apply/personal",
            complete: !!formData.email,
            items: [
                { label: "Name", value: `${formData.first_name || ""} ${formData.last_name || ""}`.trim() || "Not provided" },
                { label: "Email", value: formData.email || "Not provided" },
                { label: "Phone", value: formData.phone || "Not provided" },
                { label: "Location", value: `${formData.city || ""}, ${formData.state || ""} ${formData.country || ""}`.trim() || "Not provided" },
            ],
        },
        {
            title: "Academic History",
            icon: BookOpen,
            path: "/apply/education",
            complete: !!formData.previous_institution,
            items: [
                { label: "Institution", value: formData.previous_institution || "Not provided" },
                { label: "Degree", value: formData.previous_degree || "Not provided" },
                { label: "GPA", value: formData.gpa?.toString() || "Not provided" },
            ],
        },
        {
            title: "Documents",
            icon: FileText,
            path: "/apply/documents",
            complete: true, // Mock for now
            items: [
                { label: "Transcript", value: "Uploaded" },
                { label: "Government ID", value: "Uploaded" },
            ],
        },
        {
            title: "Personal Statement",
            icon: BookOpen,
            path: "/apply/essay",
            complete: !!formData.personal_statement,
            items: [
                {
                    label: "Essay",
                    value: formData.personal_statement
                        ? `${formData.personal_statement.length} characters`
                        : "Not provided"
                },
            ],
        },
        {
            title: "Recommendations",
            icon: Users,
            path: "/apply/recommendations",
            complete: true, // Mock for now
            items: [
                { label: "Recommenders", value: "2 added" },
            ],
        },
        {
            title: "Application Fee",
            icon: CreditCard,
            path: "/apply/payment",
            complete: true, // Mock after payment
            items: [
                { label: "Payment", value: "$50.00 Paid" },
            ],
        },
    ]

    const allComplete = sections.every((s) => s.complete)

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={8} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Review & Submit</h1>
                <p className="mt-2 text-muted-foreground">
                    Review your application before submitting
                </p>
            </div>

            {/* Review Sections */}
            <div className="space-y-4">
                {sections.map((section) => {
                    const Icon = section.icon
                    return (
                        <Card key={section.title}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Icon className="h-4 w-4" />
                                        {section.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {section.complete ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Complete
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">Incomplete</Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(section.path)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <dl className="grid gap-2 text-sm">
                                    {section.items.map((item) => (
                                        <div key={item.label} className="flex justify-between">
                                            <dt className="text-muted-foreground">{item.label}</dt>
                                            <dd className="font-medium">{item.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Separator />

            {/* Terms Agreement */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                        />
                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            I certify that all information provided in this application is true and complete
                            to the best of my knowledge. I understand that any false or misleading information
                            may result in denial of admission or dismissal from the university. I agree to the{" "}
                            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
                            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/apply/payment")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!agreed || !allComplete || isSubmitting}
                    className="min-w-[180px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Application
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
