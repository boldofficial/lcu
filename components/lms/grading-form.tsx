"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { gradeSubmission } from "@/app/actions/assignments"
import { useRouter } from "next/navigation"

interface GradingFormProps {
    submission: any
    totalPoints: number
}

export function GradingForm({ submission, totalPoints }: GradingFormProps) {
    const [grade, setGrade] = useState<string>(submission.grade?.toString() || "")
    const [feedback, setFeedback] = useState(submission.feedback || "")
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    async function handleSaveGrade() {
        console.log("Saving grade...", { grade, feedback })
        const score = parseFloat(grade)

        if (isNaN(score)) {
            toast.error("Please enter a valid numeric grade")
            return
        }

        if (score < 0 || score > totalPoints) {
            toast.error(`Grade must be between 0 and ${totalPoints}`)
            return
        }

        setSubmitting(true)
        try {
            const result = await gradeSubmission({
                submission_id: submission.id,
                grade: score,
                feedback
            })
            console.log("Grade submission result:", result)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Grade saved successfully")
                router.refresh()
            }
        } catch (e) {
            console.error("Exception calling gradeSubmission:", e)
            toast.error("An unexpected error occurred")
        }
        setSubmitting(false)
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="grade">Grade (out of {totalPoints})</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="grade"
                        type="number"
                        min="0"
                        max={totalPoints}
                        placeholder="0"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="text-lg font-medium"
                    />
                    <span className="text-muted-foreground font-medium">/ {totalPoints}</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                    id="feedback"
                    placeholder="Enter feedback for the student..."
                    rows={6}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
            </div>

            <Button
                onClick={handleSaveGrade}
                disabled={submitting}
                className="w-full"
            >
                {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                Save Grade
            </Button>
        </div>
    )
}
