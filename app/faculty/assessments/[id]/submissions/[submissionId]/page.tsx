import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText, User, Calendar, Save } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { format } from "date-fns"
import { GradingForm } from "@/components/lms/grading-form"
import { getSignedDownloadUrl } from "@/app/actions/storage"

export default async function SubmissionDetailPage({
    params,
}: {
    params: Promise<{ id: string; submissionId: string }>
}) {
    const { id, submissionId } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch submission with student and assessment details
    const { data: submission, error } = await supabase
        .from("assessment_submissions")
        .select(`
            *,
            student:profiles!assessment_submissions_student_id_fkey(id, first_name, last_name, email, avatar_url),
            assessment:assessments(
                *,
                course:courses(id, name, code, instructor_id)
            )
        `)
        .eq("id", submissionId)
        .single()

    if (error || !submission) {
        console.error("Error fetching submission details:", error)
        console.log("Submission ID:", submissionId)
        notFound()
    }

    // access control: verify instructor
    if (submission.assessment.course.instructor_id !== user.id) {
        // Check if admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile?.role !== "admin") {
            redirect("/faculty/assessments")
        }
    }

    const { assessment } = submission

    // Generate secure URL for file access
    let secureFileUrl = submission.file_url
    if (submission.file_url) {
        try {
            // Attempt to extract key from R2 URL or standard URL structure
            // URL format: https://BUCKET.r2.dev/FOLDER/FILENAME
            // We need FOLDER/FILENAME
            const url = new URL(submission.file_url)
            // If the host is the R2 dev domain, the pathname is likely the key (decoded)
            if (url.hostname.includes('r2.dev')) {
                const key = decodeURIComponent(url.pathname.substring(1)) // remove leading slash
                const tempUrl = await getSignedDownloadUrl(key)
                if (tempUrl) secureFileUrl = tempUrl
            } else if (url.pathname.startsWith('/')) {
                // Fallback: try using pathname as key if it looks like a path
                const key = decodeURIComponent(url.pathname.substring(1))
                const tempUrl = await getSignedDownloadUrl(key)
                if (tempUrl) secureFileUrl = tempUrl
            }
        } catch (e) {
            console.error("Error generating secure URL:", e)
            // Fallback to original URL if parsing fails
        }
    }

    const safeUrl = (url: string | null) => {
        if (!url) return null
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url
        return null
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader title="Grade Submission" />

            <div className="flex-1 space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href={`/faculty/assessments/${id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{assessment.course.code}</Badge>
                            <Badge variant="secondary" className="capitalize">{assessment.assessment_type}</Badge>
                        </div>
                        <h1 className="text-2xl font-bold mt-1">
                            {submission.student?.first_name} {submission.student?.last_name}'s Submission
                        </h1>
                        <p className="text-muted-foreground">
                            {assessment.title} • Submitted {format(new Date(submission.submitted_at || new Date()), "MMM d, yyyy h:mm a")}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content: The Submission */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Submission Content</CardTitle>
                                <CardDescription>
                                    Type: <span className="capitalize">{submission.submission_type}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="min-h-[400px]">
                                {submission.submission_type === 'text' || submission.content ? (
                                    <div className="prose prose-sm max-w-none dark:prose-invert rounded-md border p-4 bg-muted/30 overflow-auto break-words">
                                        <div dangerouslySetInnerHTML={{ __html: submission.content || "<p>No text content.</p>" }} />
                                    </div>
                                ) : null}

                                {(submission.submission_type === 'file' || submission.submission_type === 'both') && submission.file_url ? (
                                    <div className="mt-6">
                                        <p className="text-sm font-medium mb-3">Attached File:</p>
                                        <div className="flex items-center p-4 border rounded-lg bg-muted/50">
                                            <FileText className="h-8 w-8 text-primary mr-3" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium truncate">
                                                    {submission.file_url.split('/').pop()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {submission.file_url.endsWith('.pdf') ? 'PDF Document' : 'File Attachment'}
                                                </p>
                                            </div>
                                            <a
                                                href={safeUrl(secureFileUrl)!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </a>
                                        </div>

                                        {/* Preview for PDFs */}
                                        {submission.file_url.endsWith('.pdf') && (
                                            <div className="mt-6 border rounded-lg overflow-hidden h-[600px]">
                                                <iframe
                                                    src={safeUrl(secureFileUrl)!}
                                                    className="w-full h-full"
                                                    title="PDF Preview"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {(!submission.content && !submission.file_url) && (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <FileText className="h-10 w-10 mb-2 opacity-20" />
                                        <p>No content submitted</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Grading Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade & Feedback</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GradingForm
                                    submission={submission}
                                    totalPoints={assessment.total_points}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Student Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {submission.student?.first_name?.[0]}{submission.student?.last_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium">{submission.student?.first_name} {submission.student?.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{submission.student?.email}</p>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={
                                            submission.status === 'graded' ? 'default' :
                                                submission.status === 'submitted' ? 'secondary' : 'outline'
                                        }>
                                            {submission.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Submitted</span>
                                        <span>{submission.submitted_at ? format(new Date(submission.submitted_at), "MMM d") : "-"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
