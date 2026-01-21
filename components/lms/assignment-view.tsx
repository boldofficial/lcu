"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { FileUploader } from "@/components/lms/file-uploader"
import { Download, FileText, Send, CheckCircle, Clock, Loader2 } from "lucide-react"
import { submitAssignment } from "@/app/actions/assignments"
import { toast } from "sonner"
import type { Assessment, AssessmentSubmission } from "@/lib/types"
import { format } from "date-fns"

interface AssignmentViewProps {
    assessment: Assessment
    submission: AssessmentSubmission | null
}

export function AssignmentView({ assessment, submission }: AssignmentViewProps) {
    const [essayContent, setEssayContent] = useState(submission?.content || "")
    const [fileUrl, setFileUrl] = useState(submission?.file_url || "")
    const [submitting, setSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<"text" | "file">(
        assessment.submission_type === "file" ? "file" : "text"
    )

    const isSubmitted = submission?.status === "submitted" || submission?.status === "graded"
    const isGraded = submission?.status === "graded"

    async function handleSubmit() {
        if (activeTab === "text" && !essayContent.trim()) {
            toast.error("Please write your essay before submitting")
            return
        }
        if (activeTab === "file" && !fileUrl) {
            toast.error("Please upload a file before submitting")
            return
        }

        setSubmitting(true)
        const result = await submitAssignment({
            assessment_id: assessment.id,
            submission_type: activeTab,
            file_url: activeTab === "file" ? fileUrl : undefined,
            content: activeTab === "text" ? essayContent : undefined,
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Assignment submitted successfully!")
        }
        setSubmitting(false)
    }

    return (
        <div className="space-y-6">
            {/* Assignment Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                            {assessment.assessment_type}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{assessment.total_points} Points</Badge>
                            {assessment.due_date && (
                                <Badge variant={new Date(assessment.due_date) < new Date() ? "destructive" : "outline"}>
                                    <Clock className="mr-1 h-3 w-3" />
                                    Due: {format(new Date(assessment.due_date), "MMM d, yyyy")}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <CardTitle className="text-2xl">{assessment.title}</CardTitle>
                    {assessment.description && (
                        <CardDescription
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: assessment.description }}
                        />
                    )}
                </CardHeader>
                {assessment.attachment_url && (
                    <CardContent className="pt-0">
                        <a
                            href={assessment.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm hover:bg-muted transition-colors"
                        >
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium">Assignment Instructions</p>
                                <p className="text-xs text-muted-foreground">Click to download</p>
                            </div>
                            <Download className="h-4 w-4 ml-2" />
                        </a>
                    </CardContent>
                )}
            </Card>

            {/* Submission Status */}
            {isSubmitted && (
                <Card className={isGraded ? "border-green-500/50 bg-green-500/5" : "border-primary/50 bg-primary/5"}>
                    <CardContent className="flex items-center gap-4 py-4">
                        <CheckCircle className={`h-8 w-8 ${isGraded ? "text-green-500" : "text-primary"}`} />
                        <div className="flex-1">
                            <p className="font-semibold">
                                {isGraded ? "Graded" : "Submitted"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {submission?.submitted_at &&
                                    `Submitted on ${format(new Date(submission.submitted_at), "MMM d, yyyy 'at' h:mm a")}`}
                            </p>
                        </div>
                        {isGraded && (
                            <div className="text-right">
                                <p className="text-2xl font-bold">{submission?.grade}/{assessment.total_points}</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                        )}
                    </CardContent>
                    {submission?.feedback && (
                        <CardFooter className="border-t pt-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                                <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Submission Form */}
            {!isGraded && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Submission</CardTitle>
                        <CardDescription>
                            {assessment.submission_type === "both"
                                ? "You can submit either a file or write your response directly"
                                : assessment.submission_type === "file"
                                    ? "Upload your completed assignment file"
                                    : "Write your response in the editor below"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assessment.submission_type === "both" ? (
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "file")}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="text">Write Essay</TabsTrigger>
                                    <TabsTrigger value="file">Upload File</TabsTrigger>
                                </TabsList>
                                <TabsContent value="text">
                                    <RichTextEditor
                                        value={essayContent}
                                        onChange={setEssayContent}
                                    />
                                </TabsContent>
                                <TabsContent value="file">
                                    <div className="space-y-4">
                                        {fileUrl ? (
                                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                                <FileText className="h-5 w-5 text-primary" />
                                                <span className="flex-1 truncate text-sm">{fileUrl.split('/').pop()}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFileUrl("")}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <FileUploader
                                                onUploadComplete={(attachment) => setFileUrl(attachment.url)}
                                                bucketName="submissions"
                                                folderPath="assignments"
                                            />
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : assessment.submission_type === "text" ? (
                            <RichTextEditor
                                value={essayContent}
                                onChange={setEssayContent}
                            />
                        ) : (
                            <div className="space-y-4">
                                {fileUrl ? (
                                    <div className="flex items-center gap-2 rounded-lg border p-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="flex-1 truncate text-sm">{fileUrl.split('/').pop()}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFileUrl("")}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <FileUploader
                                        onUploadComplete={(attachment) => setFileUrl(attachment.url)}
                                        bucketName="submissions"
                                        folderPath="assignments"
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="ml-auto"
                        >
                            {submitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            {isSubmitted ? "Update Submission" : "Submit Assignment"}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
