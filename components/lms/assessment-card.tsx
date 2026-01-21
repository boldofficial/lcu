"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClipboardList, Clock, CircleCheck, CircleAlert, Play } from "lucide-react"
import type { Assessment, AssessmentType } from "@/lib/types"

interface AssessmentCardProps {
  assessment: Assessment
  submission?: any
  onClick?: () => void
}

export function AssessmentCard({ assessment, submission, onClick }: AssessmentCardProps) {
  const isCompleted = submission?.status === "graded"
  const isInProgress = submission?.status === "in_progress"
  const isPastDue = !!assessment.due_date && new Date(assessment.due_date) < new Date() && !isCompleted

  const typeColors: Record<AssessmentType, string> = {
    quiz: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    assignment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    discussion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    project: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  }

  return (
    <Card className={isCompleted ? "border-success/50" : isPastDue ? "border-destructive/50" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge className={typeColors[assessment.assessment_type]}>{assessment.assessment_type}</Badge>
          {isCompleted && (
            <Badge variant="default" className="bg-success">
              <CircleCheck className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          )}
          {isPastDue && !isCompleted && (
            <Badge variant="destructive">
              <CircleAlert className="mr-1 h-3 w-3" />
              Past Due
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{assessment.title}</CardTitle>
        <CardDescription>{assessment.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span>{assessment.total_points} Points</span>
          </div>
          {assessment.time_limit_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{assessment.time_limit_minutes} Minutes</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Attempts: {assessment.attempts_allowed}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Pass: {assessment.passing_score}%</span>
          </div>
        </div>

        {assessment.due_date && (
          <div className="rounded-lg bg-muted p-2 text-sm">
            <span className="text-muted-foreground">Due: </span>
            <span className="font-medium">
              {new Date(assessment.due_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {isCompleted && submission && (
          <div className="space-y-2 rounded-lg bg-success/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Score</span>
              <span className="text-lg font-bold text-success">
                {submission.score}/{assessment.total_points}
              </span>
            </div>
            <Progress value={(submission.score / assessment.total_points) * 100} className="h-2" />
          </div>
        )}

        <Button className="w-full" variant={isCompleted ? "outline" : "default"} disabled={isPastDue && !isCompleted} onClick={onClick}>
          {isCompleted ? (
            <>Review Submission</>
          ) : isInProgress ? (
            <>Continue Assessment</>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Assessment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
