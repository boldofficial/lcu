import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    CheckCircle2,
    Clock,
    FileText,
    Mail,
    Phone,
    Calendar,
    ArrowRight
} from "lucide-react"

export default function ApplicationStatusPage() {
    // This would normally fetch from API based on application ID
    const application = {
        id: "APP-2024-001234",
        status: "submitted" as const,
        submittedAt: new Date().toISOString(),
        program: "Master of Divinity",
        expectedDecision: "2-3 weeks",
    }

    const statusConfig = {
        submitted: {
            icon: CheckCircle2,
            label: "Application Submitted",
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/30",
            description: "Your application has been received and is being processed.",
        },
        under_review: {
            icon: Clock,
            label: "Under Review",
            color: "text-yellow-600",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
            description: "Your application is currently being reviewed by our admissions team.",
        },
        accepted: {
            icon: CheckCircle2,
            label: "Accepted",
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900/30",
            description: "Congratulations! You have been accepted to Landmark Christian University.",
        },
        rejected: {
            icon: FileText,
            label: "Not Accepted",
            color: "text-red-600",
            bgColor: "bg-red-100 dark:bg-red-900/30",
            description: "We regret to inform you that we are unable to offer you admission at this time.",
        },
        waitlisted: {
            icon: Clock,
            label: "Waitlisted",
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
            description: "You have been placed on our waiting list. We will notify you if a spot becomes available.",
        },
    }

    const currentStatus = statusConfig[application.status]
    const StatusIcon = currentStatus.icon

    const timeline = [
        {
            title: "Application Submitted",
            date: new Date().toLocaleDateString(),
            completed: true,
        },
        {
            title: "Documents Verified",
            date: "Pending",
            completed: false,
        },
        {
            title: "Under Review",
            date: "Pending",
            completed: false,
        },
        {
            title: "Decision Made",
            date: "Pending",
            completed: false,
        },
    ]

    return (
        <div className="mx-auto max-w-2xl space-y-8 py-8">
            {/* Success Message */}
            <div className={`rounded-xl p-6 text-center ${currentStatus.bgColor}`}>
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm`}>
                    <StatusIcon className={`h-8 w-8 ${currentStatus.color}`} />
                </div>
                <h1 className="text-2xl font-bold">{currentStatus.label}</h1>
                <p className="mt-2 text-muted-foreground">{currentStatus.description}</p>
                <Badge variant="outline" className="mt-4">
                    Application ID: {application.id}
                </Badge>
            </div>

            {/* Application Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Program</p>
                            <p className="font-medium">{application.program}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="font-medium">{new Date(application.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Expected Decision</p>
                            <p className="font-medium">{application.expectedDecision}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Application ID</p>
                            <p className="font-medium">{application.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                    <CardDescription>Track the progress of your application</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {timeline.map((step, index) => (
                            <div key={step.title} className="flex gap-4 pb-6 last:pb-0">
                                {/* Line */}
                                {index !== timeline.length - 1 && (
                                    <div className="absolute left-[11px] mt-6 h-full w-0.5 bg-muted" />
                                )}
                                {/* Dot */}
                                <div
                                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${step.completed
                                            ? "bg-primary text-primary-foreground"
                                            : "border-2 border-muted bg-background"
                                        }`}
                                >
                                    {step.completed && <CheckCircle2 className="h-4 w-4" />}
                                </div>
                                {/* Content */}
                                <div className="flex-1">
                                    <p className={`font-medium ${step.completed ? "" : "text-muted-foreground"}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{step.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
                <CardHeader>
                    <CardTitle>What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Calendar className="mt-1 h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium">Wait for Review</p>
                            <p className="text-sm text-muted-foreground">
                                Our admissions team will review your application within {application.expectedDecision}.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="mt-1 h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium">Check Your Email</p>
                            <p className="text-sm text-muted-foreground">
                                You will receive email notifications about your application status.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FileText className="mt-1 h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium">Recommendation Letters</p>
                            <p className="text-sm text-muted-foreground">
                                Your recommenders have been notified. You can track their submissions in your dashboard.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Contact & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Questions?</p>
                    <div className="flex items-center gap-4 mt-1">
                        <a href="mailto:admissions@lcu.edu" className="flex items-center gap-1 hover:text-primary">
                            <Mail className="h-4 w-4" />
                            admissions@lcu.edu
                        </a>
                        <a href="tel:+1-800-555-0123" className="flex items-center gap-1 hover:text-primary">
                            <Phone className="h-4 w-4" />
                            1-800-555-0123
                        </a>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/">
                        Return to Homepage
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}
