import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, FileText, CheckCircle, Clock, User } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { format } from "date-fns"

export default async function AssessmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Get assessment with course and submissions
    const { data: assessment, error } = await supabase
        .from("assessments")
        .select(`
            *,
            course:courses!inner(id, name, code, instructor_id),
            assessment_submissions(
                *,
                student:profiles!assessment_submissions_student_id_fkey(id, first_name, last_name, email)
            )
        `)
        .eq("id", id)
        .single()

    if (error || !assessment) {
        notFound()
    }

    // Verify the faculty owns this course
    if (assessment.course.instructor_id !== user.id) {
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

    const submissions = (assessment.assessment_submissions || []) as Array<{
        id: string
        status: string
        submission_type: string
        file_url: string | null
        submitted_at: string | null
        grade: number | null
        student: { id: string; first_name: string; last_name: string; email: string } | null
    }>

    const statusColors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        graded: "bg-green-100 text-green-800",
        returned: "bg-amber-100 text-amber-800",
    }

    const safeUrl = (url: string | null) => {
        if (!url) return null
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url
        return null
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader title="Assessment Submissions" />

            <div className="flex-1 space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/faculty/assessments">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{assessment.assessment_type}</Badge>
                            <Badge variant={assessment.is_published ? "default" : "secondary"}>
                                {assessment.is_published ? "Published" : "Draft"}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold mt-1">{assessment.title}</h1>
                        <p className="text-muted-foreground">
                            {assessment.course.code} - {assessment.course.name}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{submissions.length}</p>
                        <p className="text-sm text-muted-foreground">Submissions</p>
                    </div>
                </div>

                {/* Assessment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assessment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Points</p>
                            <p className="font-semibold">{assessment.total_points}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Passing Score</p>
                            <p className="font-semibold">{assessment.passing_score}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Due Date</p>
                            <p className="font-semibold">
                                {assessment.due_date
                                    ? format(new Date(assessment.due_date), "MMM d, yyyy")
                                    : "No deadline"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Submission Type</p>
                            <p className="font-semibold capitalize">{assessment.submission_type || "File"}</p>
                        </div>
                        {safeUrl(assessment.attachment_url) && (
                            <div className="md:col-span-4">
                                <a
                                    href={safeUrl(assessment.attachment_url)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Attachment
                                    <Download className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student Submissions</CardTitle>
                        <CardDescription>
                            {submissions.length === 0
                                ? "No submissions yet"
                                : `${submissions.filter(s => s.status === 'graded').length} of ${submissions.length} graded`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {submission.student?.first_name} {submission.student?.last_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {submission.student?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {submission.submission_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {submission.submitted_at
                                                    ? format(new Date(submission.submitted_at), "MMM d, h:mm a")
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[submission.status] || ""}>
                                                    {submission.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {submission.grade !== null && submission.grade !== undefined
                                                    ? `${submission.grade}/${assessment.total_points}`
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {safeUrl(submission.file_url) && (
                                                        <a
                                                            href={safeUrl(submission.file_url)!}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    )}
                                                    <Link href={`/faculty/assessments/${id}/submissions/${submission.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            {submission.status === "graded" ? "View" : "Grade"}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No submissions received yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Students will appear here once they submit their work
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
