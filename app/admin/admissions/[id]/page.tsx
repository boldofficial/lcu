"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
    ChevronLeft,
    Download,
    Mail,
    Phone,
    Calendar,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    FileText,
    BookOpen
} from "lucide-react"
import { toast } from "sonner"
import type { Application, ApplicationDocument, Recommendation } from "@/lib/types"

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [application, setApplication] = useState<Application | null>(null)
    const [documents, setDocuments] = useState<ApplicationDocument[]>([])
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)
    const [decisionNote, setDecisionNote] = useState("")
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchApplication()
    }, [id])

    async function fetchApplication() {
        const supabase = createClient()

        // Fetch application details
        const { data: appData, error: appError } = await supabase
            .from("applications")
            .select(`
        *,
        program:programs(*)
      `)
            .eq("id", id)
            .single()

        if (appError) {
            toast.error("Failed to load application")
            return
        }

        setApplication(appData as Application)
        setDecisionNote(appData.decision_notes || "")

        // Fetch documents
        const { data: docData } = await supabase
            .from("application_documents")
            .select("*")
            .eq("application_id", id)

        if (docData) setDocuments(docData as ApplicationDocument[])

        // Fetch recommendations
        const { data: recData } = await supabase
            .from("recommendations")
            .select("*")
            .eq("application_id", id)

        if (recData) setRecommendations(recData as Recommendation[])

        setLoading(false)
    }

    async function handleDecision(status: "accepted" | "rejected" | "waitlisted") {
        if (!confirm(`Are you sure you want to mark this application as ${status}?`)) return

        setProcessing(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from("applications")
            .update({
                status,
                decision_at: new Date().toISOString(),
                decision_notes: decisionNote,
                reviewer_id: user?.id
            })
            .eq("id", id)

        setProcessing(false)

        if (error) {
            toast.error("Failed to update status")
        } else {
            toast.success(`Application marked as ${status}`)
            fetchApplication()
        }
    }

    async function handleEnroll() {
        if (!application || !application.program_id) return
        if (!confirm("Are you sure you want to enroll this student? This will create an active enrollment record.")) return

        setProcessing(true)
        const supabase = createClient()

        // 1. Get student profile ID from email
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", application.applicant_email)
            .single()

        if (profileError || !profile) {
            toast.error("Could not find student profile. Ensure they have signed up.")
            setProcessing(false)
            return
        }

        // 2. Create or Update enrollment
        // We use upsert to handle cases where an enrollment might already exist 
        // (e.g. from an auto-enroll trigger or previous attempt)
        const { error: enrollError } = await supabase
            .from("enrollments")
            .upsert({
                student_id: profile.id,
                program_id: application.program_id,
                status: 'active',
                enrollment_date: new Date().toISOString(),
                credits_completed: 0,
                gpa: 0.0
            }, {
                onConflict: 'student_id, program_id'
            })

        if (enrollError) {
            console.error("Enrollment Error:", enrollError)
            toast.error(`Failed to enroll student: ${enrollError.message || "Unknown error"}`)
            setProcessing(false)
            return
        }

        // 3. Update application status
        await supabase
            .from("applications")
            .update({ status: 'enrolled' })
            .eq("id", id)

        // 4. Ensure role is student
        await supabase
            .from("profiles")
            .update({ role: 'student' })
            .eq("id", profile.id)

        setProcessing(false)
        toast.success("Student successfully enrolled!")
        fetchApplication()
    }

    if (loading || !application) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        under_review: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        waitlisted: "bg-orange-100 text-orange-800",
        enrolled: "bg-purple-100 text-purple-800",
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/admissions">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {application.applicant_first_name} {application.applicant_last_name}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" /> {application.applicant_email}
                            <span>•</span>
                            <Badge variant="secondary" className={statusColors[application.status]}>
                                {application.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {application.status !== "accepted" && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleDecision("accepted")}
                            disabled={processing}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                        </Button>
                    )}
                    {application.status !== "waitlisted" && (
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => handleDecision("waitlisted")}
                            disabled={processing}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Waitlist
                        </Button>
                    )}
                    {application.status !== "rejected" && (
                        <Button
                            variant="destructive"
                            onClick={() => handleDecision("rejected")}
                            disabled={processing}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                    )}
                    {application.status === "accepted" && (
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={handleEnroll}
                            disabled={processing}
                        >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Enroll Student
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    {/* Main Content Tabs */}
                    <Tabs defaultValue="details">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
                            <TabsTrigger value="essay">Essay</TabsTrigger>
                            <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Phone</span>
                                        <p className="font-medium">{application.applicant_phone || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Date of Birth</span>
                                        <p className="font-medium">{application.applicant_date_of_birth || "N/A"}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="text-sm text-muted-foreground">Address</span>
                                        <p className="font-medium">
                                            {application.applicant_address}<br />
                                            {application.applicant_city}, {application.applicant_state} {application.applicant_zip_code}<br />
                                            {application.applicant_country}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Academic History</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <span className="text-sm text-muted-foreground">Institution</span>
                                        <p className="font-medium">{application.previous_institution}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Degree</span>
                                        <p className="font-medium">{application.previous_degree}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">Graduation Year</span>
                                        <p className="font-medium">{application.graduation_year}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground">GPA</span>
                                        <p className="font-medium">{application.gpa || "N/A"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Uploaded Documents</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {documents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-8 w-8 text-primary" />
                                                        <div>
                                                            <p className="font-medium capitalize">{doc.document_type.replace("_", " ")}</p>
                                                            <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="essay">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Statement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg bg-muted p-6 whitespace-pre-wrap leading-relaxed">
                                        {application.personal_statement || "No essay submitted."}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="recommendations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recommendations.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No recommendations requested.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {recommendations.map((rec) => (
                                                <div key={rec.id} className="rounded-lg border p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <p className="font-medium">{rec.recommender_name}</p>
                                                            <p className="text-sm text-muted-foreground">{rec.recommender_title} • {rec.relationship}</p>
                                                        </div>
                                                        <Badge variant={rec.status === "submitted" ? "default" : "outline"}>
                                                            {rec.status}
                                                        </Badge>
                                                    </div>
                                                    {rec.letter_content && (
                                                        <div className="mt-4 border-t pt-4 text-sm whitespace-pre-wrap">
                                                            {rec.letter_content}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    {/* Sidebar Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Program</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <p className="font-medium">{application.program?.name || "Unknown Program"}</p>
                                <p className="text-sm text-muted-foreground">
                                    Applied: {new Date(application.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Review Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Add internal notes about this application..."
                                className="min-h-[150px]"
                                value={decisionNote}
                                onChange={(e) => setDecisionNote(e.target.value)}
                            />
                            <Button
                                variant="secondary"
                                className="mt-4 w-full"
                                onClick={() => handleDecision(application.status as any)} // Just save notes
                            >
                                Save Notes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
