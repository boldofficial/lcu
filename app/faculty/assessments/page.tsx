import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Clock, Users, Eye, EyeOff, Trash2, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function FacultyAssessmentsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Get all assessments for courses this faculty teaches
    const { data: assessments } = await supabase
        .from("assessments")
        .select(`
            *,
            course:courses!inner(id, name, code, instructor_id),
            assessment_submissions(id)
        `)
        .eq("course.instructor_id", user?.id)
        .order("created_at", { ascending: false })

    const typeColors: Record<string, string> = {
        quiz: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        assignment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        discussion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        project: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader title="Assessments" />

            <div className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">All Assessments</h2>
                        <p className="text-muted-foreground">Manage quizzes, assignments, and exams across your courses</p>
                    </div>
                </div>

                {assessments && assessments.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {assessments.map((assessment) => {
                            const submissionCount = assessment.assessment_submissions?.length || 0
                            const isPastDue = assessment.due_date && new Date(assessment.due_date) < new Date()

                            return (
                                <Card key={assessment.id} className={!assessment.is_published ? "opacity-60" : ""}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <Badge className={typeColors[assessment.assessment_type] || "bg-gray-100"}>
                                                {assessment.assessment_type}
                                            </Badge>
                                            <Badge variant={assessment.is_published ? "default" : "secondary"}>
                                                {assessment.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg line-clamp-1">{assessment.title}</CardTitle>
                                        <CardDescription className="line-clamp-1">
                                            {assessment.course?.code} - {assessment.course?.name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                                <span>{assessment.total_points} pts</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{submissionCount} submissions</span>
                                            </div>
                                        </div>

                                        {assessment.due_date && (
                                            <div className={`flex items-center gap-2 text-sm ${isPastDue ? "text-destructive" : "text-muted-foreground"}`}>
                                                <Clock className="h-4 w-4" />
                                                <span>Due: {format(new Date(assessment.due_date), "MMM d, yyyy")}</span>
                                            </div>
                                        )}

                                        {assessment.attachment_url && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                <span>Has attachment</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <Link href={`/faculty/assessments/${assessment.id}`} className="flex-1">
                                                <Button variant="outline" className="w-full" size="sm">
                                                    View Submissions
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No assessments created yet</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Go to a course module to create assessments
                            </p>
                            <Link href="/faculty/courses" className="mt-4">
                                <Button>Go to Courses</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
